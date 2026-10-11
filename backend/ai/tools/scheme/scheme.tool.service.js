
import mongoose from "mongoose";
import {
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
} from "../../../services/scheme.service.js";

// Register models referenced by Scheme's existing populate() calls.
import "../../../models/account.model.js";
import "../../../models/file.model.js";

/**
 * Normalize values for case-insensitive matching.
 */
const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim().toLowerCase();
};

/**
 * Match a scheme against a free-text search.
 */
const matchesSearch = (scheme, search) => {
    if (!search) return true;
    const term = normalizeValue(search);
    const searchableValues = [
        scheme.code,
        scheme.name,
        scheme.type,
        scheme.shortDescription,
        scheme.description,
        scheme.validity,
        scheme.benefitType,
        scheme.benefitValue,
        scheme.status,
        scheme.priority,
    ];
    return searchableValues.some((value) => normalizeValue(value).includes(term));
};

const matchesType = (scheme, type) => {
    if (!type) return true;
    return normalizeValue(scheme.type) === normalizeValue(type);
};

const matchesStatus = (scheme, status) => {
    if (!status) return true;
    return normalizeValue(scheme.status) === normalizeValue(status);
};

const referenceId = (value) => {
    if (value === null || value === undefined) return null;
    const id = value?._id ?? value;
    return id === null || id === undefined ? null : String(id);
};

/**
 * Return only the Scheme fields needed by the AI.
 * Do not expose raw populated Account or File documents.
 */
const sanitizeScheme = (scheme) => {
    if (!scheme) return null;
    return {
        id: referenceId(scheme._id),
        code: scheme.code ?? null,
        name: scheme.name ?? null,
        type: scheme.type ?? null,
        applicableOn: referenceId(scheme.applicableOn),
        applicableProduct: referenceId(scheme.applicableProduct),
        shortDescription: scheme.shortDescription ?? null,
        description: scheme.description ?? null,
        validFrom: scheme.validFrom ? new Date(scheme.validFrom).toISOString() : null,
        validTo: scheme.validTo ? new Date(scheme.validTo).toISOString() : null,
        validity: scheme.validity ?? null,
        noExpiry: scheme.noExpiry ?? false,
        benefitType: scheme.benefitType ?? null,
        benefitValue: scheme.benefitValue ?? null,
        maxDiscountValue: scheme.maxDiscountValue ?? null,
        minPurchase: scheme.minPurchase ?? null,
        priority: scheme.priority ?? null,
        status: scheme.status ?? null,
        metaDescription: scheme.metaDescription ?? null,
        createdAt: scheme.createdAt ?? null,
        updatedAt: scheme.updatedAt ?? null,
    };
};

/**
 * Read Scheme records through the existing domain service.
 *
 * Supported lookup modes:
 * - id: exact MongoDB document ID
 * - code: exact Scheme code
 * - otherwise: list and filter existing Scheme records
 *
 * This function never creates, updates, or deletes records.
 */
export const getSchemes = async ({
    search = "",
    id = "",
    code = "",
    type = "",
    status = "",
    limit = 10,
} = {}) => {
    const safeLimit = Math.min(Math.max(Number.isFinite(Number(limit)) ? Math.floor(Number(limit)) : 10, 1), 25);
    const normalizedId = String(id || "").trim();
    const normalizedCode = String(code || "").trim();

    // Exact ID lookup takes precedence when explicitly supplied.
    if (normalizedId) {
        if (!mongoose.isValidObjectId(normalizedId)) throw new Error("Invalid Scheme ID.");
        const scheme = await readByIdFunction(normalizedId);
        return {
            count: scheme ? 1 : 0,
            schemes: scheme ? [sanitizeScheme(scheme)] : [],
        };
    }

    // Exact scheme-code lookup uses the existing unique-key service.
    if (normalizedCode) {
        const scheme = await readByUniqueKeyFunction(normalizedCode);
        return {
            count: scheme ? 1 : 0,
            schemes: scheme ? [sanitizeScheme(scheme)] : [],
        };
    }

    // Existing service currently reads all Scheme records.
    const schemes = await readFunction();

    const filteredSchemes = schemes
        .filter((scheme) => matchesSearch(scheme, search))
        .filter((scheme) => matchesType(scheme, type))
        .filter((scheme) => matchesStatus(scheme, status))
        .slice(0, safeLimit);

    return {
        count: filteredSchemes.length,
        schemes: filteredSchemes.map(sanitizeScheme),
    };
};

export default { getSchemes };
