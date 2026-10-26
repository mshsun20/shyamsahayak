import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../services/visit.service.js";
import { generateCode } from "../utils/codeGenerator.util.js";
import { sendError, httpError, pick, validateText, requireObjectId } from "../utils/controller.util.js";

const DUPLICATE = "Visit with this code already exists";

const TEXT_FIELDS = [
    "visitType", "visitName", "partyName", "partyContact", "employeeCode", "employeeName",
    "employeePhone", "employeeDesignation", "state", "district", "pinCode",
];
const REQUIRED = { visitType: "Visit type", partyName: "Party name", employeeCode: "Employee code" };

// visitDate is stored as an array (one entry per occurrence); accept a single date or an array
const parseVisitDates = (raw) => {
    const list = (Array.isArray(raw) ? raw : [raw]).filter((d) => d !== undefined && d !== null && d !== "");
    if (!list.length) throw httpError(400, "Visit date is required");
    return list.map((d) => {
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) throw httpError(400, `Invalid visit date: ${d}`);
        return date;
    });
};

const parseBoolean = (raw) => raw === true || raw === 1 || ["true", "1", "yes"].includes(String(raw).toLowerCase());

// Validates and normalises the editable fields. On update only the fields sent are validated.
const buildPayload = (body, isUpdate = false) => {
    const payload = pick(body, [...TEXT_FIELDS, "visitDate", "newVisit", "occurrence"]);
    for (const key of TEXT_FIELDS) {
        const label = REQUIRED[key] || key;
        if (!isUpdate || payload[key] !== undefined) {
            const text = validateText(payload[key], label, { required: Boolean(REQUIRED[key]) });
            if (text || REQUIRED[key] || payload[key] !== undefined) payload[key] = text;
        }
    }
    if (!isUpdate || payload.visitDate !== undefined) payload.visitDate = parseVisitDates(payload.visitDate);
    if (payload.newVisit !== undefined) payload.newVisit = parseBoolean(payload.newVisit);
    if (payload.occurrence !== undefined) {
        const occurrence = Number(payload.occurrence);
        if (!Number.isInteger(occurrence) || occurrence < 1) throw httpError(400, "Occurrence must be a whole number of at least 1");
        payload.occurrence = occurrence;
    } else if (payload.visitDate) {
        payload.occurrence = payload.visitDate.length;
    }
    return payload;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Optional filters: ?visitType=&partyName=&employeeCode=&state=&district=&newVisit=true&date=YYYY-MM-DD
//                   &from=YYYY-MM-DD&to=YYYY-MM-DD&search=text
const buildFilter = (query = {}) => {
    const filter = {};
    for (const key of ["visitType", "partyName", "employeeCode", "state", "district"]) {
        if (query[key]) filter[key] = String(query[key]).trim();
    }
    if (query.newVisit !== undefined && query.newVisit !== "") filter.newVisit = parseBoolean(query.newVisit);

    const dayStart = (d) => {
        const date = new Date(`${d}T00:00:00`);
        if (Number.isNaN(date.getTime())) throw httpError(400, `Invalid date: ${d}`);
        return date;
    };
    if (query.date) {
        const start = dayStart(query.date);
        filter.visitDate = { $elemMatch: { $gte: start, $lt: new Date(start.getTime() + 86400000) } };
    } else if (query.from || query.to) {
        const range = {};
        if (query.from) range.$gte = dayStart(query.from);
        if (query.to) range.$lt = new Date(dayStart(query.to).getTime() + 86400000);
        filter.visitDate = { $elemMatch: range };
    }

    if (query.search) {
        const pattern = new RegExp(escapeRegex(String(query.search).trim()), "i");
        filter.$or = ["visitType", "visitName", "partyName", "employeeCode", "employeeName", "state", "district"]
            .map((key) => ({ [key]: pattern }));
    }
    return filter;
};

const create = async (req, res) => {
    try {
        const payload = buildPayload(req.body);
        const requestedCode = String(req.body.code || "").trim();
        if (requestedCode) {
            const existing = await readByUniqueKeyFunction(requestedCode);
            if (existing) return res.status(409).json({ success: false, message: DUPLICATE });
        }
        Object.assign(payload, {
            code: requestedCode || await generateCode("visit", "VIS"),
            newVisit: payload.newVisit ?? true,
            createdBy: req.user?._id || null,
            updatedBy: req.user?._id || null,
        });
        const visit = await createFunction(payload);
        return res.status(201).json({ success: true, message: "Visit created successfully", data: visit });
    } catch (error) {
        return sendError(res, error, DUPLICATE);
    }
}

const read = async (req, res) => {
    try {
        const visits = await readFunction(buildFilter(req.query));
        return res.status(200).json({ success: true, message: "All Visits fetched successfully", data: visits });
    } catch (error) {
        return sendError(res, error);
    }
}

const readById = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "visit id");
        const visit = await readByIdFunction(id);
        if (!visit) return res.status(404).json({ success: false, message: "Visit doesn't exist" });
        return res.status(200).json({ success: true, message: "Visit details fetched successfully", data: visit });
    } catch (error) {
        return sendError(res, error);
    }
}

const readByUniqueKey = async (req, res) => {
    try {
        const visit = await readByUniqueKeyFunction(String(req.params.key || "").trim());
        if (!visit) return res.status(404).json({ success: false, message: "Visit doesn't exist" });
        return res.status(200).json({ success: true, message: "Visit details fetched successfully", data: visit });
    } catch (error) {
        return sendError(res, error);
    }
}

const update = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "visit id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Visit doesn't exist" });

        const payload = buildPayload(req.body, true); // code is never changed
        payload.updatedBy = req.user?._id || null;
        const visit = await updateFunction(id, payload);
        if (!visit) throw httpError(400, "Visit update failed");
        return res.status(200).json({ success: true, message: "Visit details updated successfully", data: visit });
    } catch (error) {
        return sendError(res, error);
    }
}

const remove = async (req, res) => {
    try {
        const id = requireObjectId(req.params.id, "visit id");
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Visit doesn't exist" });
        const removed = await deleteFunction(id);
        return res.status(200).json({ success: true, message: "Visit removed successfully", data: removed });
    } catch (error) {
        return sendError(res, error);
    }
}

const Visit = { create, read, readById, readByUniqueKey, update, remove };
export default Visit;
