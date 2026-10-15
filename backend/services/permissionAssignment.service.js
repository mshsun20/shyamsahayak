import Permission from "../models/permission.model.js";
import Role from "../models/role.model.js";
import Privilege from "../models/privilege.model.js";
import Account from "../models/account.model.js";

const validatePermissions = async (permissionCodes = []) => {
    const codes = [...new Set(permissionCodes.map((code) => code.trim().toLowerCase()).filter(Boolean))];
    const permissions = await Permission.find({ code: { $in: codes }, status: "Active" }).select("_id code");

    const foundCodes = permissions.map((permission) => permission.code);
    const missingCodes = codes.filter((code) => !foundCodes.includes(code));
    if (missingCodes.length > 0) {
        const error = new Error(`Invalid or inactive permissions: ${missingCodes.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }

    return permissions;
};

export const assignRolePermissions = async (roleId, permissionCodes) => {
    const role = await Role.findById(roleId);
    if (!role) {
        const error = new Error("Role not found");
        error.statusCode = 404;
        throw error;
    }

    const permissions = await validatePermissions(permissionCodes);
    role.permissions = permissions.map((permission) => permission._id);
    await role.save();
    return Role.findById(roleId).populate({
        path: "permissions",
        select: "code name description module action status",
    });
};

export const assignPrivilegePermissions = async (privilegeId, permissionCodes) => {
    const privilege = await Privilege.findById(privilegeId);
    if (!privilege) {
        const error = new Error("Privilege not found");
        error.statusCode = 404;
        throw error;
    }

    const permissions = await validatePermissions(permissionCodes);
    privilege.permissions = permissions.map((permission) => permission._id);
    await privilege.save();
    return Privilege.findById(privilegeId).populate({
        path: "permissions",
        select: "code name description module action status",
    });
};

export const assignAccountPermissions = async (accountId, permissionCodes) => {
    const account = await Account.findById(accountId);
    if (!account) {
        const error = new Error("Account not found");
        error.statusCode = 404;
        throw error;
    }

    const permissions = await validatePermissions(permissionCodes);
    account.permissions = permissions.map((permission) => permission._id);
    await account.save();
    return Account.findById(accountId).populate({
        path: "permissions",
        select: "code name description module action status",
    });
};