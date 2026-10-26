import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    readByCombinationFunction,
    updateFunction,
    deleteFunction
} from "../services/productWeightAllocation.service.js";
import { readByIdFunction as readProductById } from "../services/product.service.js";
import { readByIdFunction as readThicknessById } from "../services/thickness.service.js";
import { readByIdFunction as readMetricById } from "../services/metric.service.js";
import { generateCode } from "../utils/codeGenerator.util.js";
import {
    sendError, httpError, pick, parsePositiveNumber, validateStatus, validateText, requireObjectId, statusFilter
} from "../utils/controller.util.js";

const DUPLICATE = "An allocation for this product, thickness and metric already exists";

// Validates and normalises the editable fields. On update only the fields sent are validated.
const buildPayload = (body, isUpdate = false) => {
    const payload = pick(body, ["product", "thickness", "metric", "unitWeight", "info", "status"]);
    for (const [key, label] of [["product", "Product"], ["thickness", "Thickness"], ["metric", "Metric"]]) {
        if (!isUpdate && !payload[key]) throw httpError(400, `${label} is required`);
        if (payload[key] !== undefined) payload[key] = requireObjectId(payload[key], label.toLowerCase());
    }
    if (!isUpdate || payload.unitWeight !== undefined) payload.unitWeight = parsePositiveNumber(payload.unitWeight, "Unit weight", 3);
    if (payload.info !== undefined) payload.info = validateText(payload.info, "Info");
    if (!isUpdate && payload.status === undefined) throw httpError(400, "Status is required");
    if (payload.status !== undefined) validateStatus(payload.status);
    return payload;
};

// Makes sure referenced master records exist. Only newly selected thickness / metric must be Active,
// so an existing allocation can still be edited after its thickness / metric is deactivated.
const validateReferences = async (payload, existing = null) => {
    if (payload.product !== undefined) {
        const product = await readProductById(payload.product);
        if (!product) throw httpError(400, "Selected product doesn't exist");
    }
    const checks = [
        ["thickness", "Thickness", readThicknessById],
        ["metric", "Metric", readMetricById],
    ];
    for (const [key, label, readById] of checks) {
        if (payload[key] === undefined) continue;
        const record = await readById(payload[key]);
        if (!record) throw httpError(400, `Selected ${label.toLowerCase()} doesn't exist`);
        const unchanged = existing && String(existing[key]?._id || existing[key]) === payload[key];
        if (!unchanged && record.status !== "Active") throw httpError(400, `Selected ${label.toLowerCase()} is inactive`);
    }
};

const create = async (req, res) => {
    try {
        const payload = buildPayload(req.body);
        await validateReferences(payload);
        const existing = await readByCombinationFunction(payload);
        if (existing) return res.status(409).json({ success: false, message: DUPLICATE });

        Object.assign(payload, {
            code: await generateCode("productWeightAllocation", "PWA"),
            createdBy: req.user?._id || null,
            updatedBy: req.user?._id || null,
        });
        const created = await createFunction(payload);
        const allocation = await readByIdFunction(created._id);
        return res.status(201).json({ success: true, message: "Product weight allocation created successfully", data: allocation });
    } catch (error) {
        return sendError(res, error, DUPLICATE);
    }
}

// Supports optional filters: ?status=Active&product=<id>&thickness=<id>&metric=<id>
const read = async (req, res) => {
    try {
        const filter = statusFilter(req.query);
        for (const key of ["product", "thickness", "metric"]) {
            if (req.query[key]) filter[key] = requireObjectId(req.query[key], key);
        }
        const allocations = await readFunction(filter);
        return res.status(200).json({ success: true, message: "All Product weight allocations fetched successfully", data: allocations });
    } catch (error) {
        return sendError(res, error);
    }
}

const readById = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "allocation id");
        const allocation = await readByIdFunction(id);
        if (!allocation) return res.status(404).json({ success: false, message: "Product weight allocation doesn't exist" });
        return res.status(200).json({ success: true, message: "Product weight allocation details fetched successfully", data: allocation });
    } catch (error) {
        return sendError(res, error);
    }
}

const readByUniqueKey = async (req, res) => {
    try {
        const allocation = await readByUniqueKeyFunction(String(req.params.key || "").trim());
        if (!allocation) return res.status(404).json({ success: false, message: "Product weight allocation doesn't exist" });
        return res.status(200).json({ success: true, message: "Product weight allocation details fetched successfully", data: allocation });
    } catch (error) {
        return sendError(res, error);
    }
}

const update = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "allocation id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Product weight allocation doesn't exist" });

        const payload = buildPayload(req.body, true);
        await validateReferences(payload, existing);
        const combination = {
            product: payload.product ?? existing.product?._id ?? existing.product,
            thickness: payload.thickness ?? existing.thickness?._id ?? existing.thickness,
            metric: payload.metric ?? existing.metric?._id ?? existing.metric,
        };
        const duplicate = await readByCombinationFunction(combination, id);
        if (duplicate) return res.status(409).json({ success: false, message: DUPLICATE });

        payload.updatedBy = req.user?._id || null;
        const updated = await updateFunction(id, payload);
        if (!updated) throw httpError(400, "Product weight allocation update failed");
        const allocation = await readByIdFunction(id);
        return res.status(200).json({ success: true, message: "Product weight allocation updated successfully", data: allocation });
    } catch (error) {
        return sendError(res, error, DUPLICATE);
    }
}

const remove = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "allocation id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Product weight allocation doesn't exist" });
        const removed = await deleteFunction(id);
        return res.status(200).json({ success: true, message: "Product weight allocation removed successfully", data: removed });
    } catch (error) {
        return sendError(res, error);
    }x
}

const ProductWeightAllocation = { create, read, readById, readByUniqueKey, update, remove };
export default ProductWeightAllocation;
