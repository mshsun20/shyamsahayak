
import { registerTool } from "../ai.tool.registry.js";
import { getAccounts } from "./account.tool.service.js";

const normalizePermissions = (permissions) => {
    if (!Array.isArray(permissions)) return [];

    return permissions
        .map((permission) => {
            if (typeof permission === "string") {
                return permission.trim().toLowerCase();
            }

            if (permission && typeof permission.code === "string") {
                return permission.code.trim().toLowerCase();
            }

            return "";
        })
        .filter(Boolean);
};

const accountTool = {
    name: "get_accounts",

    description:
        "Retrieves authorized Account information from Sahayak. " +
        "Use this tool to find accounts by user ID, account ID, name, " +
        "email, username, employee ID, status, role, privilege, reporting " +
        "details, or permission capabilities. It can search permissions " +
        "assigned directly or inherited through an active role or privilege. " +
        "Use permission, module, action, and excludePermission to answer " +
        "capability questions. This tool is read-only. Never invent account " +
        "details or claim that an account has a capability without matching " +
        "permission data.",

    input_schema: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "Exact MongoDB Account document ID.",
            },

            userId: {
                type: "string",
                description: "Exact Account userId.",
            },

            search: {
                type: "string",
                description:
                    "Free-text search across account identity fields, " +
                    "role, privilege, reporting manager, territory, and district.",
            },

            role: {
                type: "string",
                description: "Search by role name or role code.",
            },

            privilege: {
                type: "string",
                description: "Search by privilege name, description, or hierarchy.",
            },

            permission: {
                type: "string",
                description:
                    "Find accounts with an effective permission matching " +
                    "a permission code, name, module, action, or description.",
            },

            excludePermission: {
                type: "string",
                description:
                    "Exclude accounts that have an effective permission " +
                    "matching this code, name, module, action, or description.",
            },

            module: {
                type: "string",
                description:
                    "Filter by permission module, such as product, scheme, or account.",
            },

            action: {
                type: "string",
                description:
                    "Filter by permission action, such as read, create, update, or delete.",
            },

            status: {
                type: "string",
                enum: ["Active", "Inactive", "Needs Attention"],
                description: "Optional Account status filter.",
            },

            limit: {
                type: "integer",
                minimum: 1,
                maximum: 25,
                description:
                    "Maximum accounts returned. Defaults to 10; maximum 25.",
            },
        },

        additionalProperties: false,
    },

    execute: async ({ input = {}, context = {} }) => {
        if (!context.userId) {
            throw new Error("Authenticated user context is required.");
        }

        const permissions = normalizePermissions(context.permissions);

        const canReadAccounts =
            permissions.includes("account:read") ||
            permissions.includes("account:*") ||
            permissions.includes("*");

        if (!canReadAccounts) {
            throw new Error(
                "You are not authorized to access account information."
            );
        }

        return getAccounts({
            id: input.id || "",
            userId: input.userId || "",
            search: input.search || "",
            role: input.role || "",
            privilege: input.privilege || "",
            permission: input.permission || "",
            excludePermission: input.excludePermission || "",
            module: input.module || "",
            action: input.action || "",
            status: input.status || "",
            limit: input.limit ?? 10,
        });
    },
};

registerTool(accountTool);

export default accountTool;
