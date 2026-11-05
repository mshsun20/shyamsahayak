import {
    createFunction,
    readFunction,
    readFunctionById,
    updateFunction,
    deleteFunction,
} from "../services/permission.service.js";

const create = async (req, res) => {
    try {
        const payload = req.body;
        const user = req.auth?.userId || null
        const data = await createFunction(payload, user);

        return res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: data,
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
        const dataSets = await readFunction();
        return res.status(200).json({
            success: true,
            data: dataSets,
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
        const id = req.params.id;
        const details = await readFunctionById(id);
        if (!details) {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: details,
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
        const id = req.params.id;
        const payload = req.body;
        const user = req.auth?.userId || null;

        const updatedDetails = await updateFunction(id, payload, user);

        if (!updatedDetails) {
            return res.status(404).json({
                success: false,
                message: "Permission not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Permission updated successfully",
            data: updatedDetails,
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
        const id = req.params.id;
        const removalDetails = await deleteFunction(id);

        if (!removalDetails) {
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