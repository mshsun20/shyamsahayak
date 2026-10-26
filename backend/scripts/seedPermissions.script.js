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
    {
        code: "thickness:create",
        name: "Create Thickness",
        description: "Create a new thickness",
        module: "thickness",
        action: "create",
    },
    {
        code: "thickness:read",
        name: "Read Thickness",
        description: "Read thickness information",
        module: "thickness",
        action: "read",
    },
    {
        code: "thickness:update",
        name: "Update Thickness",
        description: "Update thickness information",
        module: "thickness",
        action: "update",
    },
    {
        code: "thickness:delete",
        name: "Delete Thickness",
        description: "Delete thickness",
        module: "thickness",
        action: "delete",
    },
    {
        code: "metric:create",
        name: "Create Metric",
        description: "Create a new metric",
        module: "metric",
        action: "create",
    },
    {
        code: "metric:read",
        name: "Read Metric",
        description: "Read metric information",
        module: "metric",
        action: "read",
    },
    {
        code: "metric:update",
        name: "Update Metric",
        description: "Update metric information",
        module: "metric",
        action: "update",
    },
    {
        code: "metric:delete",
        name: "Delete Metric",
        description: "Delete metric",
        module: "metric",
        action: "delete",
    },
    {
        code: "product-weight-allocation:create",
        name: "Create Product Weight Allocation",
        description: "Create a new product weight allocation",
        module: "product-weight-allocation",
        action: "create",
    },
    {
        code: "product-weight-allocation:read",
        name: "Read Product Weight Allocation",
        description: "Read product weight allocation information",
        module: "product-weight-allocation",
        action: "read",
    },
    {
        code: "product-weight-allocation:update",
        name: "Update Product Weight Allocation",
        description: "Update product weight allocation information",
        module: "product-weight-allocation",
        action: "update",
    },
    {
        code: "product-weight-allocation:delete",
        name: "Delete Product Weight Allocation",
        description: "Delete product weight allocation",
        module: "product-weight-allocation",
        action: "delete",
    },
    {
        code: "visit:create",
        name: "Create Visit",
        description: "Create a new visit",
        module: "visit",
        action: "create",
    },
    {
        code: "visit:read",
        name: "Read Visit",
        description: "Read visit information",
        module: "visit",
        action: "read",
    },
    {
        code: "visit:update",
        name: "Update Visit",
        description: "Update visit information",
        module: "visit",
        action: "update",
    },
    {
        code: "visit:delete",
        name: "Delete Visit",
        description: "Delete visit",
        module: "visit",
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