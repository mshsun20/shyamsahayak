import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    readByValueUnitFunction,
    updateFunction,
    deleteFunction
} from "../services/thickness.service.js";
import { countByReferenceFunction } from "../services/productWeightAllocation.service.js";
import { generateCode } from "../utils/codeGenerator.util.js";
import {
    sendError, httpError, pick, parsePositiveNumber, validateStatus, validateText, requireObjectId, statusFilter
} from "../utils/controller.util.js";

const DUPLICATE = "Thickness with this value and unit already exists";

// Validates and normalises the editable fields. On update only the fields sent are validated.
const buildPayload = (body, isUpdate = false) => {
    const payload = pick(body, ["value", "unit", "details", "status"]);
    if (!isUpdate || payload.value !== undefined) payload.value = parsePositiveNumber(payload.value, "Thickness value", 2);
    if (!isUpdate || payload.unit !== undefined) payload.unit = validateText(payload.unit, "Unit", { required: true, max: 20 });
    if (payload.details !== undefined) payload.details = validateText(payload.details, "Details");
    if (payload.status !== undefined) validateStatus(payload.status);
    return payload;
};

const create = async (req, res) => {
    try {
        const payload = buildPayload(req.body);
        const existing = await readByValueUnitFunction(payload.value, payload.unit);
        if (existing) return res.status(409).json({ success: false, message: DUPLICATE });

        Object.assign(payload, {
            code: await generateCode("thickness", "THK"),
            status: payload.status || "Active",
            createdBy: req.user?._id || null,
            updatedBy: req.user?._id || null,
        });
        const thickness = await createFunction(payload);
        return res.status(201).json({ success: true, message: "Thickness created successfully", data: thickness });
    } catch (error) {
        return sendError(res, error, DUPLICATE);
    }
}

const read = async (req, res) => {
    try {
        const thicknesses = await readFunction(statusFilter(req.query));
        return res.status(200).json({ success: true, message: "All Thicknesses fetched successfully", data: thicknesses });
    } catch (error) {
        return sendError(res, error);
    }
}

const readById = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "thickness id");
        const thickness = await readByIdFunction(id);
        if (!thickness) return res.status(404).json({ success: false, message: "Thickness doesn't exist" });
        return res.status(200).json({ success: true, message: "Thickness details fetched successfully", data: thickness });
    } catch (error) {
        return sendError(res, error);
    }
}

const readByUniqueKey = async (req, res) => {
    try {
        const thickness = await readByUniqueKeyFunction(String(req.params.key || "").trim());
        if (!thickness) return res.status(404).json({ success: false, message: "Thickness doesn't exist" });
        return res.status(200).json({ success: true, message: "Thickness details fetched successfully", data: thickness });
    } catch (error) {
        return sendError(res, error);
    }
}

const update = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "thickness id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Thickness doesn't exist" });

        const payload = buildPayload(req.body, true);
        const value = payload.value ?? existing.value;
        const unit = payload.unit ?? existing.unit;
        const duplicate = await readByValueUnitFunction(value, unit, id);
        if (duplicate) return res.status(409).json({ success: false, message: DUPLICATE });

        payload.updatedBy = req.user?._id || null;
        const thickness = await updateFunction(id, payload);
        if (!thickness) throw httpError(400, "Thickness update failed");
        return res.status(200).json({ success: true, message: "Thickness details updated successfully", data: thickness });
    } catch (error) {
        return sendError(res, error, DUPLICATE);
    }
}

const remove = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "thickness id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Thickness doesn't exist" });

        const usage = await countByReferenceFunction("thickness", id);
        if (usage > 0) {
            return res.status(409).json({
                success: false,
                message: `Thickness is used in ${usage} product weight allocation(s). Mark it Inactive instead.`,
            });
        }
        const removed = await deleteFunction(id);
        return res.status(200).json({ success: true, message: "Thickness removed successfully", data: removed });
    } catch (error) {
        return sendError(res, error);
    }
}

const Thickness = { create, read, readById, readByUniqueKey, update, remove };
export default Thickness;
