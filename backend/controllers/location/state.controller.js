import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../../services/location/state.service.js";
import { mapValidObjectId } from "../../utils/objectValidation.util.js";

const create = async (req, res) => {
    try {
        const statePayload = req.body;
        const user = req.user || null;
        const existingState = await readByUniqueKeyFunction(String(statePayload.name).trim());
        if (existingState) return res.status(409).json({ success: false, message: "State already exists" });
        
        Object.assign(statePayload, {
            createdBy: user?._id || null,
            status: "Active",
        })
        const state = await createFunction(statePayload);
        if (!state) return res.status(401).json({ success: false, message: "State creation failed" });
        return res.status(201).json({
            success: true,
            message: "State created succesfully",
            data: state
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
        const states = await readFunction();
        res.status(200).json({
            success: true,
            message: "All States fetched successfully",
            data: states
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
        const stateDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "State details fetched successfully",
            data: stateDetails
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
        const stateDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "State details fetched successfully",
            data: stateDetails
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
        const statePayload = req.body;
        const user = req.user || null;
        const existingState = await readByIdFunction(id);
        if (!existingState) return res.status(404).json({ success: false, message: "State doesn't exist" });

        const items = ["_id", "code"]
        for (const key of items) {
            delete statePayload[key]
        }
        Object.assign(statePayload, {
            updatedBy: user?._id || null,
            status: "Active",
        })
        const updatedState = await updateFunction(id, statePayload);
        if (!updatedState) return res.status(401).json({ success: false, message: "State update failed" });
        return res.status(201).json({
            success: true,
            message: "State details updated successfully",
            data: updatedState
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
        const existingState = await readByIdFunction(id);
        if (!existingState) return res.status(404).json({ success: false, message: "State doesn't exist" });

        const removalDetails = await deleteFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "State removal failed" });
        return res.status(200).json({
            success: true,
            message: "State removed successfully",
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

const State = { create, read, readById, readByUniqueKey, update, remove };
export default State;