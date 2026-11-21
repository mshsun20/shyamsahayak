
import "../config/env.js";

import path from "path";

import {
    extractOfficeFile,
} from "../document-intelligence/processors/office.extractor.js";


try {
    const relativePath = process.argv[2];

    if (!relativePath) {
        throw new Error(
            "Please provide the PPTX path inside uploads."
        );
    }

    const filePath = path.resolve(
        process.cwd(),
        relativePath
    );

    const originalName = path.basename(filePath);

    console.log("[PPTX TEST] Extracting:", originalName);

    const result = await extractOfficeFile({
        filePath,
        originalName,
    });

    console.log("\nExtraction method:");
    console.log(result.method);

    console.log("\nExtracted characters:");
    console.log(result.characters);

    const text = result.text;

    console.log("\n========== SALT SPRAY MATCH ==========");

    const index = text.toLowerCase().indexOf(
        "salt spray test"
    );

    if (index === -1) {
        throw new Error(
            "Salt Spray Test heading was not found."
        );
    }

    console.log(
        text.slice(
            Math.max(0, index - 400),
            Math.min(text.length, index + 1000)
        )
    );

    console.log("\n======================================");

    const expectedPattern = /Salt Spray Test:\s*AZ\s*150\s*=\s*1200\s*hours;\s*AZ\s*70\s*=\s*1000\s*hours/i;

    if (!expectedPattern.test(text)) {
        throw new Error(
            "Expected AZ 70 salt spray relationship was not reconstructed."
        );
    }

    console.log(
        "\n[PPTX EXTRACTION TEST PASSED]"
    );

} catch (error) {
    console.error(
        "\n[PPTX EXTRACTION TEST FAILED]",
        error
    );

    process.exitCode = 1;
}
