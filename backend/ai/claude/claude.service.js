import anthropicClient from "../../config/claude.js";
import env from "../../config/env.js";


/**
 * Create a Claude Messages API request.
 *
 * This service is responsible only for communicating
 * with Anthropic.
 */
export const createClaudeMessage = async ({
    system,
    messages,
    tools = [],
    toolChoice = null,
}) => {

    if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error(
            "Claude messages are required"
        );
    }


    const payload = {
        model: env.claudeModel,

        max_tokens: env.claudeMaxTokens,

        messages,
    };


    if (system) {
        payload.system = system;
    }


    if (Array.isArray(tools) && tools.length > 0) {

        payload.tools = tools;
    }


    if (toolChoice) {

        payload.tool_choice = toolChoice;
    }


    try {

        const response =
            await anthropicClient.messages.create(
                payload
            );


        return response;

    } catch (error) {

        console.error(
            "Claude API request failed:",
            error
        );

        throw error;
    }
};


/**
 * Extract normal text blocks from Claude response.
 */
export const extractText = (response) => {

    if (!response?.content) {
        return "";
    }


    return response.content
        .filter(
            (block) =>
                block.type === "text"
        )
        .map(
            (block) =>
                block.text
        )
        .join("\n")
        .trim();
};


/**
 * Extract tool_use blocks from Claude response.
 */
export const extractToolUses = (response) => {

    if (!response?.content) {
        return [];
    }


    return response.content.filter(
        (block) =>
            block.type === "tool_use"
    );
};


/**
 * Check whether Claude requested
 * one or more tools.
 */
export const hasToolUse = (response) => {

    if (!response?.content) {
        return false;
    }


    return response.content.some(
        (block) =>
            block.type === "tool_use"
    );
};


export default {
    createClaudeMessage,
    extractText,
    extractToolUses,
    hasToolUse,
};