import {
    registerTool,
} from "../ai.tool.registry.js";


const testTool = {
    name: "get_system_test_data",
    description: "Returns a small fixed test response to verify that Sahayak AI tool execution is working correctly. Use this tool only when testing the AI tool infrastructure.",
    input_schema: {
        type: "object",
        properties: {},
        additionalProperties: false,
    },
    execute: async ({ context }) => {
        return {
            message: "Sahayak AI tool infrastructure is working correctly.",
            authenticatedUser: context?.userId || null,
            timestamp: new Date().toISOString(),
        };
    },
};

/**
 * Register the tool when this module is loaded.
 */
registerTool(testTool);


export default testTool;