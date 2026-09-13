import {
    createFunction,
    readFunction,
    readFunctionById,
    updateFunction,
    deleteFunction,
} from "../services/permission.service.js";

const create = async (req, res) => {
    try {
        const permission = await createFunction(
            req.body,
            req.auth?.userId || null
        );

        return res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: permission,
        });
    } catch (error) {
        console.error("Create permission error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create permission",
        });
    }
};

const read = async (req, res) => {
    try {
        const permissions = await readFunction();

        return res.status(200).json({
            success: true,
            data: permissions,
        });
    } catch (error) {
        console.error("Read permissions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch permissions",
        });
    }
};

const readById = async (req, res) => {
    try {
        const permission = await readFunctionById(req.params.id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: permission,
        });
    } catch (error) {
        console.error("Read permission error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch permission",
        });
    }
};

const update = async (req, res) => {
    try {
        const permission = await updateFunction(
            req.params.id,
            req.body,
            req.auth?.userId || null
        );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Permission updated successfully",
            data: permission,
        });
    } catch (error) {
        console.error("Update permission error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update permission",
        });
    }
};

const remove = async (req, res) => {
    try {
        const permission = await deletePermission(req.params.id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Permission deleted successfully",
        });
    } catch (error) {
        console.error("Delete permission error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete permission",
        });
    }
};

const Permission = { create, read, readById, update, remove };
export default Permission;