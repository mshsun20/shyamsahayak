
import { registerTool } from "../ai.tool.registry.js";
import { getSchemes } from "./scheme.tool.service.js";

const schemeTool = {
    name: "get_schemes",

    description:
        "Retrieves scheme information from the Sahayak scheme catalog. " +
        "Use this tool when the user asks about schemes, scheme codes, " +
        "scheme names, scheme types, scheme status, validity, applicable " +
        "products, discounts, benefits, minimum purchase requirements, " +
        "or scheme descriptions. Use an exact code or document ID when " +
        "provided. Never invent scheme details.",

    input_schema: {
        type: "object",
        properties: {
            search: {
                type: "string",
                description:
                    "Optional case-insensitive search across scheme code, " +
                    "name, type, descriptions, validity text, benefits, " +
                    "status, and priority.",
            },
            id: {
                type: "string",
                description:
                    "Optional exact MongoDB Scheme document ID.",
            },
            code: {
                type: "string",
                description:
                    "Optional exact Scheme code. Prefer this when the user " +
                    "provides a specific scheme code.",
            },
            type: {
                type: "string",
                description: "Optional exact scheme type filter.",
            },
            status: {
                type: "string",
                enum: [
                    "Draft",
                    "Upcoming",
                    "Active",
                    "Inactive",
                    "Expired",
                ],
                description: "Optional exact scheme status filter.",
            },
            limit: {
                type: "integer",
                minimum: 1,
                maximum: 25,
                description:
                    "Maximum number of schemes to return for list/search " +
                    "queries. Defaults to 10 and is capped at 25.",
            },
        },

        additionalProperties: false,
    },

    execute: async ({ input = {}, context = {} }) => {
        // Require trusted backend-provided authentication context.
        if (!context.userId) throw new Error("Authenticated user context is required.");
        return getSchemes({
            search: input.search || "",
            id: input.id || "",
            code: input.code || "",
            type: input.type || "",
            status: input.status || "",
            limit: input.limit ?? 10,
        });
    },
};

registerTool(schemeTool);

export default schemeTool;
