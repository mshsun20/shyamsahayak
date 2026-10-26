import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    readByValueFunction,
    updateFunction,
    deleteFunction
} from "../services/metric.service.js";
import { countByReferenceFunction } from "../services/productWeightAllocation.service.js";
import { generateCode } from "../utils/codeGenerator.util.js";
import {
    sendError, httpError, pick, validateStatus, validateText, requireObjectId, statusFilter
} from "../utils/controller.util.js";

const DUPLICATE = "Metric with this value already exists";

// Validates and normalises the editable fields. On update only the fields sent are validated.
const buildPayload = (body, isUpdate = false) => {
    const payload = pick(body, ["value", "details", "status"]);
    if (!isUpdate || payload.value !== undefined) payload.value = validateText(payload.value, "Metric value", { required: true, max: 100 });
    if (payload.details !== undefined) payload.details = validateText(payload.details, "Details");
    if (!isUpdate && payload.status === undefined) throw httpError(400, "Status is required");
    if (payload.status !== undefined) validateStatus(payload.status);
    return payload;
};

const create = async (req, res) => {
    try {
        const payload = buildPayload(req.body);
        const existing = await readByValueFunction(payload.value);
        if (existing) return res.status(409).json({ success: false, message: DUPLICATE });

        Object.assign(payload, {
            code: await generateCode("metric", "MET"),
            createdBy: req.user?._id || null,
            updatedBy: req.user?._id || null,
        });
        const metric = await createFunction(payload);
        return res.status(201).json({ success: true, message: "Metric created successfully", data: metric });
    } catch (error) {
        return sendError(res, error, DUPLICATE);
    }
}

const read = async (req, res) => {
    try {
        const metrics = await readFunction(statusFilter(req.query));
        return res.status(200).json({ success: true, message: "All Metrics fetched successfully", data: metrics });
    } catch (error) {
        return sendError(res, error);
    }
}

const readById = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "metric id");
        const metric = await readByIdFunction(id);
        if (!metric) return res.status(404).json({ success: false, message: "Metric doesn't exist" });
        return res.status(200).json({ success: true, message: "Metric details fetched successfully", data: metric });
    } catch (error) {
        return sendError(res, error);
    }
}

const readByUniqueKey = async (req, res) => {
    try {
        const metric = await readByUniqueKeyFunction(String(req.params.key || "").trim());
        if (!metric) return res.status(404).json({ success: false, message: "Metric doesn't exist" });
        return res.status(200).json({ success: true, message: "Metric details fetched successfully", data: metric });
    } catch (error) {
        return sendError(res, error);
    }
}

const update = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "metric id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Metric doesn't exist" });

        const payload = buildPayload(req.body, true);
        if (payload.value !== undefined) {
            const duplicate = await readByValueFunction(payload.value, id);
            if (duplicate) return res.status(409).json({ success: false, message: DUPLICATE });
        }

        payload.updatedBy = req.user?._id || null;
        const metric = await updateFunction(id, payload);
        if (!metric) throw httpError(400, "Metric update failed");
        return res.status(200).json({ success: true, message: "Metric details updated successfully", data: metric });
    } catch (error) {
        return sendError(res, error, DUPLICATE);
    }
}

const remove = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "metric id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Metric doesn't exist" });

        const usage = await countByReferenceFunction("metric", id);
        if (usage > 0) {
            return res.status(409).json({
                success: false,
                message: `Metric is used in ${usage} product weight allocation(s). Mark it Inactive instead.`,
            });
        }
        const removed = await deleteFunction(id);
        return res.status(200).json({ success: true, message: "Metric removed successfully", data: removed });
    } catch (error) {
        return sendError(res, error);
    }
}

const Metric = { create, read, readById, readByUniqueKey, update, remove };
export default Metric;
