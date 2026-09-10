import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    removeFunction
} from "../services/role.service.js";
import { mapValidObjectId } from "../utils/objectValidation.util.js";

const create = async (req, res) => {
    try {
        const rolePayload = req.body;
        const user = req.user || null;
        const existingRole = await readByUniqueKeyFunction(String(rolePayload.name).trim());
        if (existingRole) return res.status(409).json({ success: false, message: "Role already exists" });
        
        Object.assign(rolePayload, {
            createdBy: user?._id || null,
            status: "Active",
        })
        const role = await createFunction(rolePayload);
        if (!role) return res.status(401).json({ success: false, message: "Role creation failed" });
        return res.status(201).json({
            success: true,
            message: "Role created succesfully",
            data: role
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const read = async (req, res) => {
    try {
        const roles = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Roles fetched successfully",
            data: roles
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const readById = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const roleDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Role details fetched successfully",
            data: roleDetails
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const readByUniqueKey = async (req, res) => {
    try {
        const uniqueKey = String(req.query.name || "").trim();
        const roleDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Role details fetched successfully",
            data: roleDetails
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const update = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const rolePayload = req.body;
        const user = req.user || null;
        const existingRole = await readByIdFunction(id);
        if (!existingRole) return res.status(404).json({ success: false, message: "Role doesn't exist" });

        const items = ["_id", "username"]
        for (const key of items) {
            delete rolePayload[key]
        }
        Object.assign(rolePayload, {
            updatedBy: user?._id || null,
            status: "Active",
        })
        const updatedRole = await updateFunction(id, rolePayload);
        if (!updatedRole) return res.status(401).json({ success: false, message: "Role update failed" });
        return res.status(201).json({
            success: true,
            message: "Role details updated successfully",
            data: updatedRole
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const remove = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const existingRole = await readByIdFunction(id);
        if (!existingRole) return res.status(404).json({ success: false, message: "Role doesn't exist" });

        const removalDetails = await removeFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "Role removal failed" });
        return res.status(200).json({
            success: true,
            message: "Role removed successfully",
            data: removalDetails
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

const Role = { create, read, readById, readByUniqueKey, update, remove };
export default Role;