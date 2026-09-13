import mongoose from "mongoose";
import Permission from "../models/permission.model.js";
import env from "../config/env.js";

const permissions = [
    {
        code: "account:create",
        name: "Create Account",
        description: "Create a new account",
        module: "account",
        action: "create",
    },
    {
        code: "account:read",
        name: "Read Account",
        description: "Read account information",
        module: "account",
        action: "read",
    },
    {
        code: "account:update",
        name: "Update Account",
        description: "Update account information",
        module: "account",
        action: "update",
    },
    {
        code: "account:delete",
        name: "Delete Account",
        description: "Delete account",
        module: "account",
        action: "delete",
    },
    
    {
        code: "permission:create",
        name: "Create Permission",
        description: "Create a new permission",
        module: "permission",
        action: "create",
    },
    {
        code: "permission:read",
        name: "Read Permission",
        description: "Read permission information",
        module: "permission",
        action: "read",
    },
    {
        code: "permission:update",
        name: "Update Permission",
        description: "Update permission information",
        module: "permission",
        action: "update",
    },
    {
        code: "permission:delete",
        name: "Delete Permission",
        description: "Delete permission",
        module: "permission",
        action: "delete",
    },

    {
        code: "role:create",
        name: "Create Role",
        module: "role",
        action: "create",
    },
    {
        code: "role:read",
        name: "Read Role",
        module: "role",
        action: "read",
    },
    {
        code: "role:update",
        name: "Update Role",
        module: "role",
        action: "update",
    },
    {
        code: "role:delete",
        name: "Delete Role",
        module: "role",
        action: "delete",
    },

    {
        code: "privilege:create",
        name: "Create Privilege",
        module: "privilege",
        action: "create",
    },
    {
        code: "privilege:read",
        name: "Read Privilege",
        module: "privilege",
        action: "read",
    },
    {
        code: "privilege:update",
        name: "Update Privilege",
        module: "privilege",
        action: "update",
    },
    {
        code: "privilege:delete",
        name: "Delete Privilege",
        module: "privilege",
        action: "delete",
    },

    {
        code: "api-client:create",
        name: "Create API Client",
        description: "Create a new API client",
        module: "api-client",
        action: "create",
    },
    {
        code: "api-client:read",
        name: "Read API Client",
        description: "Read API client information",
        module: "api-client",
        action: "read",
    },
    {
        code: "api-client:update",
        name: "Update API Client",
        description: "Update API client information",
        module: "api-client",
        action: "update",
    },
    {
        code: "api-client:delete",
        name: "Delete API Client",
        description: "Delete API client",
        module: "api-client",
        action: "delete",
    },
];

const seedPermissions = async () => {
    try {
        /*
         * Use the same MongoDB connection string your application uses.
         *
         * Adjust env.mongoUri to your actual env property if different.
         */
        await mongoose.connect(env.dbUrl);

        console.log("MongoDB connected.");
        for (const permission of permissions) {
            await Permission.updateOne({ code: permission.code }, {
                $set: permission,
            }, { upsert: true });

            console.log(`✓ ${permission.code}`);
        }
        console.log("\nPermissions seeded successfully.");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Permission seed failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedPermissions();