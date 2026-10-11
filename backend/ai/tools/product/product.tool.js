import { registerTool } from "../ai.tool.registry.js";
import { getProducts } from "./product.tool.service.js";

/**
 * Product AI Tool
 *
 * Allows Claude to retrieve product information through
 * controlled backend functionality.
 *
 * Claude does NOT get direct database access.
 */
const productTool = {
    name: "get_products",
    description: "Retrieves product information from the Sahayak product catalog. Use this tool when the user asks about products, product details, product categories, pricing, GST, product descriptions, product codes, or other product catalog information. Never invent product information when this tool can provide the actual data.",
    input_schema: {
        type: "object",
        properties: {
            search: {
                type: "string",
                description: "Optional text to search across product code, name, category, descriptions, unit, and tags.",
            },
            code: {
                type: "string",
                description: "Optional exact product code. Use this when the user provides or clearly refers to a specific product code.",
            },
            category: {
                type: "string",
                description: "Optional product category filter.",
            },
            status: {
                type: "string",
                enum: ["Draft", "Published", "Archived"],
                description: "Optional product publication status filter.",
            },
            limit: {
                type: "integer",
                minimum: 1,
                maximum: 25,
                description: "Maximum number of products to return. Use a small number unless the user explicitly requests more.",
            },
        },

        additionalProperties: false,
    },

    execute: async ({ input = {}, context = {} }) => {
        /**
         * Authorization is intentionally performed by the
         * backend rather than by Claude.
         */
        // const permissions = Array.isArray(context.permissions) ? context.permissions : [];

        // const hasProductPermission = permissions.includes("product:read") ||
        //     permissions.includes("product:*") ||
        //     permissions.includes("*");

        // if (!hasProductPermission) {
        //     throw new Error("You are not authorized to access product information.");
        // }

        /**
         * The authenticated user comes from backend context.
         *
         * We intentionally do NOT accept userId from Claude input.
         */
        if (!context.userId) throw new Error("Authenticated user context is required.");
        return getProducts({
            search: input.search || "",
            code: input.code || "",
            category: input.category || "",
            status: input.status || "",
            limit: input.limit || 10,
        });
    },
};

registerTool(productTool);

export default productTool;