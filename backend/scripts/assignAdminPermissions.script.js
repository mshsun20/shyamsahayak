import mongoose from "mongoose";
import Account from "../models/account.model.js";
import Permission from "../models/permission.model.js";
import env from "../config/env.js";

const assignAdminPermissions = async () => {
    try {
        await mongoose.connect(env.dbUrl);
        console.log("MongoDB connected.");
        const admin = await Account.findOne({ username: "smetalicsSA" });
        if (!admin) {
            throw new Error('Account with username "smetalicsSA" was not found.');
        }

        const permissionCodes = [
            "account:create",
            "account:read",
            "account:update",
            "account:delete",

            "role:create",
            "role:read",
            "role:update",
            "role:delete",

            "privilege:create",
            "privilege:read",
            "privilege:update",
            "privilege:delete",
        ];

        const permissions = await Permission.find({
            code: { $in: permissionCodes },
            status: "Active",
        }).select("_id code");

        const foundCodes = permissions.map((permission) => permission.code);
        const missingPermissions = permissionCodes.filter((code) => !foundCodes.includes(code));
        if (missingPermissions.length > 0) {
            throw new Error(`Missing permissions: ${missingPermissions.join(", ")}`);
        }

        admin.permissions = permissions.map((permission) => permission._id);
        await admin.save();
        console.log(`Permissions assigned to ${admin.username || admin.userId}`);
        console.log(permissions.map((permission) => permission.code));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Failed to assign admin permissions:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

assignAdminPermissions();