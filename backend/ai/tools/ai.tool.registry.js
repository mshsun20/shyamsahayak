const toolRegistry = new Map();


/**
 * Register one AI tool.
 */
export const registerTool = (tool) => {

    if (!tool || typeof tool !== "object") {
        throw new Error(
            "AI tool definition is required"
        );
    }


    const {
        name,
        description,
        input_schema,
        execute,
    } = tool;


    if (!name || typeof name !== "string") {

        throw new Error(
            "AI tool name is required"
        );
    }


    if (
        !description ||
        typeof description !== "string"
    ) {

        throw new Error(
            `AI tool description is required: ${name}`
        );
    }


    if (
        !input_schema ||
        typeof input_schema !== "object"
    ) {

        throw new Error(
            `AI tool input_schema is required: ${name}`
        );
    }


    if (typeof execute !== "function") {

        throw new Error(
            `AI tool execute function is required: ${name}`
        );
    }


    if (toolRegistry.has(name)) {

        throw new Error(
            `AI tool already registered: ${name}`
        );
    }


    toolRegistry.set(name, {
        name,
        description,
        input_schema,
        execute,
    });


    return toolRegistry.get(name);
};


/**
 * Register multiple AI tools.
 */
export const registerTools = (
    tools = []
) => {

    if (!Array.isArray(tools)) {

        throw new Error(
            "AI tools must be provided as an array"
        );
    }


    tools.forEach(registerTool);


    return tools;
};


/**
 * Retrieve a registered tool.
 */
export const getTool = (
    toolName
) => {

    return toolRegistry.get(
        toolName
    ) || null;
};


/**
 * Check whether a tool exists.
 */
export const hasTool = (
    toolName
) => {

    return toolRegistry.has(
        toolName
    );
};


/**
 * Get all registered tools.
 */
export const getRegisteredTools = () => {

    return Array.from(
        toolRegistry.values()
    );
};


/**
 * Get only the definitions that Claude needs.
 *
 * The execute function is intentionally removed.
 */
export const getClaudeToolDefinitions = () => {

    return getRegisteredTools().map(
        ({
            name,
            description,
            input_schema,
        }) => ({
            name,
            description,
            input_schema,
        })
    );
};


export default {
    registerTool,
    registerTools,
    getTool,
    hasTool,
    getRegisteredTools,
    getClaudeToolDefinitions,
};