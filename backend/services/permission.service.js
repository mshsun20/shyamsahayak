import Permission from "../models/permission.model.js";

export const createFunction = async (payload, userId = null) => {
    const {
        code,
        name,
        description = "",
        module,
        action,
        status = "Active",
    } = payload;
    const normalizedCode = String(payload?.code)?.trim().toLowerCase();

    const existingPermission = await Permission.findOne({ code: normalizedCode });
    if (existingPermission) {
        throw new Error("Permission code already exists");
    }

    Object.assign(payload, {})

    const permission = await Permission.create({
        code: normalizedCode,
        name,
        description,
        module,
        action,
        status,
        createdBy: userId,
        updatedBy: userId,
    });
    return permission;
};

export const readFunction = async (filter = {}) => {
    return Permission.find(filter)
        .populate("createdBy", "userId fullName username")
        .populate("updatedBy", "userId fullName username")
        .sort({ module: 1, action: 1 })
        .lean();
};

export const readFunctionById = async (id) => {
    return Permission.findById(id)
        .populate("createdBy", "userId fullName username")
        .populate("updatedBy", "userId fullName username")
        .lean();
};

export const updateFunction = async (
    id,
    payload,
    userId = null
) => {
    const allowedFields = [
        "name",
        "description",
        "module",
        "action",
        "status",
    ];
    const updateData = {};
    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            updateData[field] = payload[field];
        }
    }
    updateData.updatedBy = userId;

    return Permission.findByIdAndUpdate(id, { $set: updateData }, { returnDocument: "after", runValidators: true })
        .populate("createdBy", "userId fullName username")
        .populate("updatedBy", "userId fullName username")
        .lean();
};

export const deleteFunction = async (id) => {
    return Permission.findByIdAndDelete(id);
};