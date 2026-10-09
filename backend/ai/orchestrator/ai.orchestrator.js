import {
    createClaudeMessage,
    extractText,
    extractToolUses,
    hasToolUse,
} from "../claude/claude.service.js";

import {
    executeTools,
} from "../tools/ai.tool.executor.js";

import {
    getClaudeToolDefinitions,
} from "../tools/ai.tool.registry.js";

import SYSTEM_PROMPT from "../prompts/system.prompt.js";


const MAX_TOOL_ROUNDS = 8;

/**
 * Main Sahayak AI execution pipeline.
 */
export const runAI = async ({
    message,
    messages = [],
    context = {},
}) => {

    if (
        !message &&
        (!Array.isArray(messages) ||
            messages.length === 0)
    ) {

        throw new Error(
            "AI message is required"
        );
    }


    let conversationMessages =
        Array.isArray(messages)
            ? [...messages]
            : [];


    /**
     * Add the new user message.
     */
    if (message) {

        conversationMessages.push({
            role: "user",

            content: message,
        });
    }


    /**
     * Retrieve the tools registered by the
     * backend application.
     */
    const tools =
        getClaudeToolDefinitions();


    let toolRound = 0;


    while (
        toolRound < MAX_TOOL_ROUNDS
    ) {

        toolRound += 1;


        /**
         * Ask Claude what to do next.
         */
        const response =
            await createClaudeMessage({
                system: SYSTEM_PROMPT,

                messages:
                    conversationMessages,

                tools,
            });


        /**
         * Claude has finished and did not
         * request any backend tool.
         */
        if (
            !hasToolUse(response)
        ) {

            return {
                type: "final",

                text:
                    extractText(
                        response
                    ),

                response,

                usage:
                    response.usage ||
                    null,

                stopReason:
                    response.stop_reason ||
                    null,

                toolRounds:
                    toolRound,

                messages:
                    conversationMessages,
            };
        }


        /**
         * Extract Claude's requested tools.
         */
        const toolUses =
            extractToolUses(
                response
            );


        /**
         * Preserve Claude's complete response.
         */
        conversationMessages.push({
            role: "assistant",

            content:
                response.content,
        });


        /**
         * Execute the tools using trusted
         * backend context.
         */
        const executions =
            await executeTools({
                toolUses,

                context,
            });


        /**
         * Convert backend results into
         * Anthropic tool_result blocks.
         */
        const toolResults =
            executions.map(
                (execution) => {

                    if (
                        execution.success
                    ) {

                        return {
                            type:
                                "tool_result",

                            tool_use_id:
                                execution.toolUseId,

                            content:
                                JSON.stringify(
                                    execution.result ??
                                    null
                                ),
                        };
                    }


                    return {
                        type:
                            "tool_result",

                        tool_use_id:
                            execution.toolUseId,

                        is_error:
                            true,

                        content:
                            JSON.stringify({
                                error:
                                    execution.error ||
                                    "Tool execution failed",
                            }),
                    };
                }
            );


        /**
         * Send tool results back to Claude.
         */
        conversationMessages.push({
            role: "user",

            content:
                toolResults,
        });
    }


    throw new Error(
        `Maximum AI tool execution rounds exceeded: ${MAX_TOOL_ROUNDS}`
    );
};


export default {
    runAI,
};