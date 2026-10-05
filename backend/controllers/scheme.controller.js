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

// Reusable functions
const codeGenerator = (text) => {
    const code = String(text || "").trim().toLowerCase();
    return `KB-${asciiGenerator(code)}}`;
}

const create = async (req, res) => {
    try {
        const schemePayload = req.body;
        const user = req.user || null;
        const file = req.file || null;
        console.log(file);
        if (file && file?.size > 0) {
            const uploadReport = await uploadSingleFile(file)
            console.log(uploadReport);
            schemePayload.banner = uploadReport?.uploaded?._id || null;
        }

        const schemeCode = codeGenerator(String(schemePayload.name).trim());
        const existingScheme = await readByUniqueKeyFunction(schemeCode);
        if (existingScheme) return res.status(409).json({ success: false, message: "Scheme already exists" });
        
        Object.assign(schemePayload, {
            code: schemeCode,
            createdBy: user?._id || null,
            status: schemePayload.status || "Draft",
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
const upload = async (req, res) => {
    try {
        const schemeDataSheet = req.body?.schemes || [];
        const user = req.user || null;
        schemeDataSheet?.forEach(async (scheme, i) => {
            const existingScheme = await readByUniqueKeyFunction(String(scheme.code).trim());
            if (existingScheme) {
                Object.assign(scheme, {
                    status: scheme.status || "Draft",
                    updatedBy: user?._id || null,
                })
                const { code, name, ...newPayload } = scheme;
                const updatedUpload = await updateFunction(existingScheme?._id, newPayload);
                // console.log(updatedUpload);
                schemeDataSheet[i].uploadReport = updatedUpload;
            }
            else {
                Object.assign(scheme, {
                    status: scheme.status || "Draft",
                    createdBy: user?._id || null,
                })
                const newUpload = await createFunction(scheme);
                schemeDataSheet[i].uploadReport = newUpload;
            }
        });
        if (schemeDataSheet?.length > 0) {
            console.log(schemeDataSheet);
            return res.status(201).json({
                success: true,
                message: "Scheme bulk imported done",
                data: schemeDataSheet
            })
        }
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
        console.log(file);
        if (file && file?.size > 0) {
            const uploadReport = await uploadSingleFile(file)
            console.log(uploadReport);
            schemePayload.banner = uploadReport?.uploaded?._id || null;
        }

        const existingScheme = await readByIdFunction(id);
        if (!existingScheme) return res.status(404).json({ success: false, message: "Scheme doesn't exist" });

        const items = ["_id", "code", "name"]
        for (const key of items) {
            delete schemePayload[key]
        }
        Object.assign(schemePayload, {
            updatedBy: user?._id || null,
            status: schemePayload.status || "Draft",
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

const Scheme = { create, upload, read, readById, readByUniqueKey, update, remove }

export default Scheme;