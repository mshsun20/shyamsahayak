import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../../services/mapping/location.service.js";
import { mapValidObjectId } from "../../utils/objectValidation.util.js";

const create = async (req, res) => {
    try {
        const payload = req.body;
        const existingData = await readByUniqueKeyFunction(payload?.code);
        if (existingData) {
            return res.status(409).json({ success: false, message: "Location mapping already exist", data: existingData });
        }

        const data = await createFunction(payload);
        if (data) {
            return res.status(201).json({ success: true, message: "Location mapping created successfully", data: data });
        }
        else {
            return res.status(401).json({ success: false, message: "Location mapping failed" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const upload = async (req, res) => {}
const read = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim();
        const filter = {}
        if (search !== "") {
            filter.$or = [
                { userId: { $regex: search, $options: "i" } },
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } },
            ]
        }
        if (status !== "") {
            filter.status = { $regex: `^${status}$`, $options: "i" };
        }

        const data = await readFunction(filter);
        res.status(200).json({
            success: true,
            message: "All Location mapping details fetched successfully",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const readById = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id)
        const data = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Location mapping details fetched successfully",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const readByUniqueKey = async (req, res) => {
    try {
        const uniqueKey = String(req.params.key || "").trim();
        const data = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Location mapping details fetched successfully",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const update = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const payload = req.body;
        const user = req.user || null;
        const existingData = await readByIdFunction(id);
        if (!existingData) return res.status(404).json({ success: true, message: "Location mapping doesn't exist" });
        const items = ["_id", "code"];
        for (const key of items) {
            delete payload[key];
        }
        Object.assign(payload, {
            update: user?._id || null,
            status: "Active",
        })
        const updatedData = await updateFunction(id, payload);
        if (!updatedData) return res.status(401).json({ success: false, message: "Location mapping update failed." });
        return res.status(201).json({
            success: true,
            message: "Location mapping updated successfully",
            data: updatedData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
const remove = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const existingData = await readByIdFunction(id);
        if (!existingData) return res.status(404).json({ success: true, message: "Location mapping doesn't exist" });
        const removedData = await deleteFunction(id);
        if (!removedData) return res.status(400).json({ success: false, message: "Location mapping removal failed" });
        return res.status(200).json({
            success: true,
            message: "Location mapping removed successfully",
            data: removedData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const Location = { create, upload, read, readById, readByUniqueKey, update, remove };
export default Location;