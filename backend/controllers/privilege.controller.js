import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    removeFunction
} from "../services/privilege.service.js";
import { mapValidObjectId } from "../utils/objectValidation.util.js";

const create = async (req, res) => {
    try {
        const privilegePayload = req.body;
        const user = req.user || null;
        const existingPrivilege = await readByUniqueKeyFunction(String(privilegePayload.name).trim());
        if (existingPrivilege) return res.status(409).json({ success: false, message: "Privilege already exists" });
        
        Object.assign(privilegePayload, {
            createdBy: user?._id || null,
            status: "Active",
        })
        const privilege = await createFunction(privilegePayload);
        if (!privilege) return res.status(401).json({ success: false, message: "Privilege creation failed" });
        return res.status(201).json({
            success: true,
            message: "Privilege created succesfully",
            data: privilege
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
        const privileges = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Privileges fetched successfully",
            data: privileges
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
        const privilegeDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Privilege details fetched successfully",
            data: privilegeDetails
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
        const privilegeDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Privilege details fetched successfully",
            data: privilegeDetails
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
        const privilegePayload = req.body;
        const user = req.user || null;
        const existingPrivilege = await readByIdFunction(id);
        if (!existingPrivilege) return res.status(404).json({ success: false, message: "Privilege doesn't exist" });

        const items = ["_id", "name"]
        for (const key of items) {
            delete privilegePayload[key]
        }
        Object.assign(privilegePayload, {
            updatedBy: user?._id || null,
            status: "Active",
        })
        const updatedPrivilege = await updateFunction(id, privilegePayload);
        if (!updatedPrivilege) return res.status(401).json({ success: false, message: "Privilege update failed" });
        return res.status(201).json({
            success: true,
            message: "Privilege details updated successfully",
            data: updatedPrivilege
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
        const existingPrivilege = await readByIdFunction(id);
        if (!existingPrivilege) return res.status(404).json({ success: false, message: "Privilege doesn't exist" });

        const removalDetails = await removeFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "Privilege removal failed" });
        return res.status(200).json({
            success: true,
            message: "Privilege removed successfully",
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

const Privilege = { create, read, readById, readByUniqueKey, update, remove };
export default Privilege;