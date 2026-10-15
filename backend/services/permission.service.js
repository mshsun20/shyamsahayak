import Permission from "../models/permission.model.js";

const generateCode = (payload) => {
    const normalizedModule = String(payload?.module || "")?.trim()?.toLowerCase();
    const normalizedAction = String(payload?.action || "")?.trim()?.toLowerCase();
    return `${normalizedModule}:${normalizedAction}`;
}

export const createFunction = async (payload, userId = null) => {
    const code = generateCode(payload);
    const existingPermission = await Permission.findOne({ code });
    if (existingPermission) throw new Error("Permission code already exists");
    Object.assign(payload, { code, status: "Active", createdBy: userId })
    const permission = await Permission.create(payload);
    return permission;
};

export const readFunction = async (filter = {}) => {
    return Permission.find(filter)
        .populate("createdBy", "userId fullName username")
        .populate("updatedBy", "userId fullName username")
        .sort({ code: 1, module: 1, action: 1 })
        .lean();
};

export const readFunctionById = async (id) => {
    return Permission.findById(id)
        .populate("createdBy", "userId fullName username")
        .populate("updatedBy", "userId fullName username")
        .lean();
};

export const updateFunction = async (id, payload, userId = null) => {
    const allowedFields = [
        "name",
        "description",
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