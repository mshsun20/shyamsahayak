import { getTool } from "./ai.tool.registry.js";


/**
 * Execute one AI tool.
 *
 * context contains trusted backend information,
 * such as the authenticated user.
 */
export const executeTool = async ({ toolName, input = {}, context = {} }) => {
    if (!toolName) throw new Error("AI tool name is required");

    const tool = getTool(toolName);
    if (!tool) throw new Error(`AI tool not found: ${toolName}`);

    try {
        const result = await tool.execute({ input, context });
        return {
            success: true,
            toolName,
            result,
        };
    } catch (error) {
        console.error(`AI tool execution failed [${toolName}]:`, error);
        return {
            success: false,
            toolName,
            error: error.message || "AI tool execution failed",
        };
    }
};


/**
 * Execute all tool requests returned
 * by Claude.
 */
export const executeTools = async ({ toolUses = [], context = {} }) => {
    if (!Array.isArray(toolUses)) throw new Error("Tool uses must be an array");

    const results = await Promise.all(toolUses.map(async (toolUse) => {
        const execution = await executeTool({
            toolName: toolUse.name,
            input: toolUse.input,
            context,
        });
        return {
            toolUseId: toolUse.id,
            toolName: toolUse.name,
            ...execution,
        };
    }));
    return results;
};

export default {
    executeTool,
    executeTools,
};