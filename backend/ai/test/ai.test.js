import mongoose from "mongoose";
import connectDB from "../../config/dbcon.js";
import "../tools/ai.tool.bootstrap.js";
import { getClaudeToolDefinitions } from "../tools/ai.tool.registry.js";
import { runAI } from "../orchestrator/ai.orchestrator.js";


const runTest = async () => {
    console.log("\n========================================");
    console.log("Sahayak AI Tool Infrastructure Test");
    console.log("========================================\n");

    try {
        // ----------------------------------------
        // STEP 1: Verify AI tool registration
        // ----------------------------------------

        const tools = getClaudeToolDefinitions();
        console.log("REGISTERED AI TOOLS:");
        console.log(tools.map((tool) => tool.name));
        const requiredTools = ["get_system_test_data", "get_products", "get_schemes"];
        for (const requiredTool of requiredTools) {
            if (!tools.some((tool) => tool.name === requiredTool)) {
                throw new Error(`AI tool was not registered: ${requiredTool}`);
            }
        }
        console.log("\nAI tool registration: OK");

        // ----------------------------------------
        // STEP 2: Connect to MongoDB
        // ----------------------------------------
        console.log("\n========================================");
        console.log("STEP 2: DATABASE CONNECTION");
        console.log("========================================\n");
        await connectDB();
        if (mongoose.connection.readyState !== 1) {
            throw new Error("MongoDB connection was not established.");
        }
        console.log("MongoDB connection: OK");

        // ----------------------------------------
        // TEST 1: System Test Tool
        // ----------------------------------------
        console.log("\n========================================");
        console.log("TEST 1: SYSTEM TOOL");
        console.log("========================================\n");
        const systemResult = await runAI({
            message: "Please use the system test tool and tell me whether the AI tool infrastructure is working.",
            context: {
                userId: "TEST-USER-001",
                permissions: ["ai:test"],
            },
        });

        console.log("AI RESPONSE:");
        console.log(systemResult.text);
        console.log("\nAI METADATA:");
        console.log({
            type: systemResult.type,
            stopReason: systemResult.stopReason,
            toolRounds: systemResult.toolRounds,
            usage: systemResult.usage,
        });

        // ----------------------------------------
        // TEST 2: Product AI Tool
        // ----------------------------------------
        console.log("\n========================================");
        console.log("TEST 2: PRODUCT TOOL");
        console.log("========================================\n");
        const productResult = await runAI({
            message: "Use the product tool to retrieve available products. Report their names, codes, categories, prices, price units, and GST rates. Only report information returned by the tool.",
            context: {
                userId: "TEST-USER-001",
                permissions: ["product:read"],
            },
        });

        console.log("AI RESPONSE:");
        console.log(productResult.text);
        console.log("\nAI METADATA:");
        console.log({
            type: productResult.type,
            stopReason: productResult.stopReason,
            toolRounds: productResult.toolRounds,
            usage: productResult.usage,
        });

        // ----------------------------------------
        // TEST 2: Scheme AI Tool
        // ----------------------------------------
        console.log("\n========================================");
        console.log("TEST 2: SCHEME TOOL");
        console.log("========================================\n");
        const schemeResult = await runAI({
            message: "Use the scheme tool to retrieve available schemes. Only schemes information returned by the tool.",
            context: {
                userId: "TEST-USER-001",
                permissions: ["scheme:read"],
            },
        });

        console.log("AI RESPONSE:");
        console.log(schemeResult.text);
        console.log("\nAI METADATA:");
        console.log({
            type: schemeResult.type,
            stopReason: schemeResult.stopReason,
            toolRounds: schemeResult.toolRounds,
            usage: schemeResult.usage,
        });

        console.log("\n========================================");
        console.log("AI TESTS COMPLETED");
        console.log("========================================\n");
    } catch (error) {
        console.error("\n========================================");
        console.error("AI TEST FAILED");
        console.error("========================================\n");
        console.error(error);
        process.exitCode = 1;
    } finally {
        // ----------------------------------------
        // STEP 3: Close the database connection
        // ----------------------------------------
        if (mongoose.connection.readyState !== 0) {
            try {
                await mongoose.disconnect();
                console.log("\nMongoDB connection closed.");
            } catch (disconnectError) {
                console.error("Failed to close MongoDB connection:", disconnectError.message);
                process.exitCode = 1;
            }
        }
    }
};

runTest();