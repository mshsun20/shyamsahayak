
import "../config/env.js";

import mongoose from "mongoose";

import connectDB from "../config/dbcon.js";

import {
    searchKnowledgeBase,
} from "../ai/tools/knowledgeBase/knowledgeBase.tool.service.js";


const query =
    process.argv.slice(2).join(" ") ||
    "What is the AZ 70 salt spray test rating?";


try {
    await connectDB();

    console.log("--------------------------------------------");
    console.log("[KB SEARCH TEST]");
    console.log("Query:", query);
    console.log("--------------------------------------------");

    const result = await searchKnowledgeBase({
        query,

        /*
         * This script is a local backend diagnostic.
         * It does not expose an API endpoint.
         */
        userId: "local-kb-diagnostic",

        limit: 10,
    });

    console.log("\nSearch result:");

    console.log(
        JSON.stringify(result, null, 2)
    );

    if (!result.found) {
        console.error(
            "\n[KB SEARCH TEST FAILED]"
        );

        process.exitCode = 2;
    } else {
        console.log(
            "\n[KB SEARCH TEST PASSED]"
        );
    }

} catch (error) {
    console.error(
        "[KB SEARCH TEST ERROR]",
        error
    );

    process.exitCode = 1;

} finally {
    await mongoose.disconnect();
}
