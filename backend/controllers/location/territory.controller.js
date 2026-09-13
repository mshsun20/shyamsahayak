import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../../services/location/territory.service.js";
import { mapValidObjectId } from "../../utils/objectValidation.util.js";

const create = async (req, res) => {
    try {
        const territoryPayload = req.body;
        const user = req.user || null;
        const existingTerritory = await readByUniqueKeyFunction(String(territoryPayload.name).trim());
        if (existingTerritory) return res.status(409).json({ success: false, message: "Territory already exists" });
        
        Object.assign(territoryPayload, {
            createdBy: user?._id || null,
            status: "Active",
        })
        const territory = await createFunction(territoryPayload);
        if (!territory) return res.status(401).json({ success: false, message: "Territory creation failed" });
        return res.status(201).json({
            success: true,
            message: "Territory created succesfully",
            data: territory
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
        const territories = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Territories fetched successfully",
            data: territories
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
        const territoryDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Territory details fetched successfully",
            data: territoryDetails
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
        const uniqueKey = String(req.params.key || "").trim();
        const territoryDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Territory details fetched successfully",
            data: territoryDetails
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
        const territoryPayload = req.body;
        const user = req.user || null;
        const existingTerritory = await readByIdFunction(id);
        if (!existingTerritory) return res.status(404).json({ success: false, message: "Territory doesn't exist" });

        const items = ["_id", "code"]
        for (const key of items) {
            delete territoryPayload[key]
        }
        Object.assign(territoryPayload, {
            updatedBy: user?._id || null,
            status: "Active",
        })
        const updatedTerritory = await updateFunction(id, territoryPayload);
        if (!updatedTerritory) return res.status(401).json({ success: false, message: "Territory update failed" });
        return res.status(201).json({
            success: true,
            message: "Territory details updated successfully",
            data: updatedTerritory
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
        const existingTerritory = await readByIdFunction(id);
        if (!existingTerritory) return res.status(404).json({ success: false, message: "Territory doesn't exist" });

        const removalDetails = await deleteFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "Territory removal failed" });
        return res.status(200).json({
            success: true,
            message: "Territory removed successfully",
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

const Territory = { create, read, readById, readByUniqueKey, update, remove };
export default Territory;