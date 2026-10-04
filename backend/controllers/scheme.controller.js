import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../services/scheme.service.js";
import {
    uploadSingleFile,
} from "../services/file.service.js";
import { mapValidObjectId } from "../utils/objectValidation.util.js";

const create = async (req, res) => {
    try {
        const schemePayload = req.body;
        const user = req.user || null;
        const file = req.file || null;
        const uploadReport = await uploadSingleFile(file)
        console.log(uploadReport);

        const existingScheme = await readByUniqueKeyFunction(String(schemePayload.name).trim());
        if (existingScheme) return res.status(409).json({ success: false, message: "Scheme already exists" });
        
        Object.assign(schemePayload, {
            createdBy: user?._id || null,
            status: schemePayload.status || "Draft",
            banner: uploadReport?.uploaded?._id || null,
        })
        const scheme = await createFunction(schemePayload);
        if (!scheme) return res.status(401).json({ success: false, message: "Scheme creation failed" });
        return res.status(201).json({
            success: true,
            message: "Scheme created succesfully",
            data: scheme
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
        const schemes = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Schemes fetched successfully",
            data: schemes
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
        const schemeDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Scheme details fetched successfully",
            data: schemeDetails
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
        const schemeDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Scheme details fetched successfully",
            data: schemeDetails
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
        const schemePayload = req.body;
        const user = req.user || null;
        const file = req.file || null;
        const uploadReport = await uploadSingleFile(file)
        console.log(uploadReport);

        const existingScheme = await readByIdFunction(id);
        if (!existingScheme) return res.status(404).json({ success: false, message: "Scheme doesn't exist" });

        const items = ["_id", "name"]
        for (const key of items) {
            delete schemePayload[key]
        }
        Object.assign(schemePayload, {
            updatedBy: user?._id || null,
            status: schemePayload.status || "Draft",
            banner: uploadReport?.uploaded?._id || null,
        })
        const updatedScheme = await updateFunction(id, schemePayload);
        if (!updatedScheme) return res.status(401).json({ success: false, message: "Scheme update failed" });
        return res.status(201).json({
            success: true,
            message: "Scheme details updated successfully",
            data: updatedScheme
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
        const existingScheme = await readByIdFunction(id);
        if (!existingScheme) return res.status(404).json({ success: false, message: "Scheme doesn't exist" });

        const removalDetails = await deleteFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "Scheme removal failed" });
        return res.status(200).json({
            success: true,
            message: "Scheme removed successfully",
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

const Scheme = { create, read, readById, readByUniqueKey, update, remove }

export default Scheme;