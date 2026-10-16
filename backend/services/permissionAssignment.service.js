import Permission from "../models/permission.model.js";
import Role from "../models/role.model.js";
import Privilege from "../models/privilege.model.js";
import Account from "../models/account.model.js";

const validatePermissions = async (permissionIds = []) => {
    const ids = [...new Set(permissionIds.map((id) => id.trim()).filter(Boolean))];
    const permissions = await Permission.find({ _id: { $in: ids }, status: "Active" }).select("_id code");
    const foundIds = permissions.map((permission) => String(permission._id).trim());
    const missingIds = ids.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
        const error = new Error(`Invalid or inactive permissions: ${missingIds.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }

    return permissions;
};

export const assignRolePermissions = async (roleId, permissionIds) => {
    const role = await Role.findById(roleId);
    if (!role) {
        const error = new Error("Role not found");
        error.statusCode = 404;
        throw error;
    }

    const permissions = await validatePermissions(permissionIds);
    role.permissions = permissions.map((permission) => permission._id);
    await role.save();
    return Role.findById(roleId).populate({
        path: "permissions",
        select: "code name description module action status",
    });
};

export const assignPrivilegePermissions = async (privilegeId, permissionIds) => {
    const privilege = await Privilege.findById(privilegeId);
    if (!privilege) {
        const error = new Error("Privilege not found");
        error.statusCode = 404;
        throw error;
    }

    const permissions = await validatePermissions(permissionIds);
    privilege.permissions = permissions.map((permission) => permission._id);
    await privilege.save();
    return Privilege.findById(privilegeId).populate({
        path: "permissions",
        select: "code name description module action status",
    });
};

export const assignAccountPermissions = async (accountId, permissionIds) => {
    const account = await Account.findById(accountId);
    if (!account) {
        const error = new Error("Account not found");
        error.statusCode = 404;
        throw error;
    }

    // console.log(permissionIds);
    const permissions = await validatePermissions(permissionIds);
    account.permissions = permissions.map((permission) => permission._id);
    await account.save();
    return Account.findById(accountId).populate({
        path: "permissions",
        select: "code name description module action status",
    });
};