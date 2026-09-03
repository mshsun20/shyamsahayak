import anthropicClient from "../config/claude.js";
import env from "../config/env.js";
import {
    toolDefinitions,
    toolHandlers
} from "../ai/tools.registry.js";
import SYSTEM_PROMPT from "../ai/prompts/system.prompt.js";

export const sendMessageToClaude = async ({
    message,
    user,
}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const systemPrompt = `
    ${SYSTEM_PROMPT}
    CURRENT DATE CONTEXT: Today 's date is ${currentDate.toISOString().split("T")[0]}. The current calendar year is ${currentYear}. DATE INTERPRETATION: - If the user specifies a month without a year, interpret that month as belonging to the current calendar year. - Example: If the current year is 2026 and the user asks "Show my performance for August", use month "2026-08".
    `;
    const messages = [
        { role: "user", content: message },
    ];

    while(true) {
        const response = await anthropicClient.messages.create({
            model: env.claudeModel || "claude-sonnet-5",
            max_tokens: env.claudeMaxTokens ? parseInt(env.claudeMaxTokens, 10) : 1000,
            system: systemPrompt,
            tools: toolDefinitions,
            messages: messages,
        });

        messages.push({ role: "assistant", content: response.content });
        const toolUseBlocks = response.content.filter((msg) => msg.type === "tool_use");

        if (toolUseBlocks.length === 0) {
            const text = response.content
                .filter((msg) => msg.type === "text")
                .map((msg) => msg.text)
                .join(" ");
            return {
                text: text,
                usage: response.usage,
                model: response.model,
            };
        }

        const toolResults = [];

        for (const toolUse of toolUseBlocks) {
            const toolName = toolUse.name;
            const toolInput = toolUse.input;

            console.log(`Claude requested tool: ${toolName} with input:`, toolInput);
            const toolHandler = toolHandlers[toolName];
            if (!toolHandler) {
                toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    is_error: true,
                    content: `Unknown tool: ${toolName}`,
                });
                continue;
            }

            try {
                const result = await toolHandler({ ...toolInput, user });
                toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    is_error: false,
                    content: JSON.stringify(result),
                });
            } catch (error) {
                console.error(`Tool ${toolName} failed:`, error);
                toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    is_error: true,
                    content: `The tool ${toolName} failed to retrieve the requested information.`,
                });
            }
        }

        messages.push({ role: "user", content: toolResults });
    }
};