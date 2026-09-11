import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    removeFunction
} from "../../services/location/district.service.js";
import { mapValidObjectId } from "../utils/objectValidation.utils.js";

const create = async (req, res) => {
    try {
        const districtPayload = req.body;
        const user = req.user || null;
        const existingDistrict = await readByUniqueKeyFunction(String(districtPayload.name).trim());
        if (existingDistrict) return res.status(409).json({ success: false, message: "District already exists" });
        
        Object.assign(districtPayload, {
            createdBy: user?._id || null,
            status: "Active",
        })
        const district = await createFunction(districtPayload);
        if (!district) return res.status(401).json({ success: false, message: "District creation failed" });
        return res.status(201).json({
            success: true,
            message: "District created succesfully",
            data: district
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
        const districts = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Districts fetched successfully",
            data: districts
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
        const districtDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "District details fetched successfully",
            data: districtDetails
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
        const districtDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "District details fetched successfully",
            data: districtDetails
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
        const districtPayload = req.body;
        const user = req.user || null;
        const existingDistrict = await readByIdFunction(id);
        if (!existingDistrict) return res.status(404).json({ success: false, message: "District doesn't exist" });

        const items = ["_id", "username"]
        for (const key of items) {
            delete districtPayload[key]
        }
        Object.assign(districtPayload, {
            updatedBy: user?._id || null,
            status: "Active",
        })
        const updatedDistrict = await updateFunction(id, districtPayload);
        if (!updatedDistrict) return res.status(401).json({ success: false, message: "District update failed" });
        return res.status(201).json({
            success: true,
            message: "District details updated successfully",
            data: updatedDistrict
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
        const existingDistrict = await readByIdFunction(id);
        if (!existingDistrict) return res.status(404).json({ success: false, message: "District doesn't exist" });

        const removalDetails = await removeFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "District removal failed" });
        return res.status(200).json({
            success: true,
            message: "District removed successfully",
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

const District = { create, read, readById, readByUniqueKey, update, remove };
export default District;