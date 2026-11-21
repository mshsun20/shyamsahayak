
import "../config/env.js";

import fs from "fs/promises";
import path from "path";
import util from "util";
import { OfficeParser } from "officeparser";

const filePath = path.resolve(
    process.cwd(),
    process.argv[2] || ""
);

if (!process.argv[2]) {
    throw new Error(
        'Usage: node scripts/debugPptxSlide.js "uploads/file.pptx"'
    );
}

const buffer = await fs.readFile(filePath);

const ast = await OfficeParser.parseOffice(buffer, {
    ignoreNotes: false,
});

const slides = (ast.content || []).filter(
    node => node.type === "slide"
);

const slide = slides[8];

if (!slide) {
    throw new Error("Slide 9 was not found.");
}

const records = [];

function visit(node, depth = 0) {
    if (!node || typeof node !== "object") return;

    const textParts = [];

    function collectText(current) {
        if (!current || typeof current !== "object") return;

        if (
            typeof current.text === "string" &&
            current.text.trim()
        ) {
            textParts.push(current.text);
        }

        if (Array.isArray(current.children)) {
            current.children.forEach(collectText);
        }
    }

    collectText(node);

    const text = [...new Set(textParts)]
        .join(" | ")
        .replace(/\s+/g, " ")
        .trim();

    if (text) {
        records.push({
            depth,
            type: node.type || null,
            text,
            bounds: node.bounds || null,
            metadata: node.metadata || null,
        });
    }

    if (Array.isArray(node.children)) {
        node.children.forEach(child => {
            visit(child, depth + 1);
        });
    }
}

visit(slide);

const report = {
    slideNumber: 9,
    slideMetadata: slide.metadata,
    slideKeys: Object.keys(slide),
    records,
};

await fs.writeFile(
    "pptx-slide-9-debug.json",
    JSON.stringify(report, null, 2),
    "utf8"
);

console.log("Slide 9 diagnostic report generated.");
console.log("Total records:", records.length);
console.log("Output: pptx-slide-9-debug.json");

console.log(
    util.inspect(records, {
        depth: 6,
        colors: false,
        maxArrayLength: null,
        maxStringLength: null,
    })
);
