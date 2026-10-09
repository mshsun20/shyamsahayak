import {
    readFunction,
    readByUniqueKeyFunction,
} from "../../../services/product.service.js";
import "../../../models/account.model.js";
import "../../../models/file.model.js";

/**
 * Normalize a value so that comparisons remain safe.
 */
const normalizeValue = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim().toLowerCase();
};

/**
 * Check whether the product matches the supplied search term.
 */
const matchesSearch = (product, search) => {
    if (!search) {
        return true;
    }

    const searchValue = normalizeValue(search);

    const searchableValues = [
        product.code,
        product.name,
        product.category,
        product.unit,
        product.shortDescription,
        product.description,
        ...(Array.isArray(product.tags) ? product.tags : []),
    ];

    return searchableValues.some((value) =>
        normalizeValue(value).includes(searchValue)
    );
};

/**
 * Check whether the product matches the requested category.
 */
const matchesCategory = (product, category) => {
    if (!category) {
        return true;
    }

    return (
        normalizeValue(product.category) ===
        normalizeValue(category)
    );
};

/**
 * Check whether the product matches the requested status.
 */
const matchesStatus = (product, status) => {
    if (!status) {
        return true;
    }

    return (normalizeValue(product.status) === normalizeValue(status));
};

/**
 * Remove unnecessary/internal information before returning
 * product data to Claude.
 */
const sanitizeProduct = (product) => {
    if (!product) {
        return null;
    }

    return {
        id: product._id || null,
        code: product.code || null,
        name: product.name || null,
        category: product.category || null,
        unit: product.unit || null,
        shortDescription: product.shortDescription || null,
        description: product.description || null,
        price: product.price || null,
        priceUnit: product.priceUnit || null,
        gstRate: product.gstRate || null,
        tags: Array.isArray(product.tags) ? product.tags : [],
        priority: product.priority || null,
        metaTitle: product.metaTitle || null,
        metaDescription: product.metaDescription || null,
        status: product.status || null,
    };
};

/**
 * Get products for AI queries.
 *
 * This function intentionally uses the existing Product service.
 * It does NOT allow Claude to construct MongoDB queries.
 */
export const getProducts = async ({
    search = "",
    code = "",
    category = "",
    status = "",
    limit = 10,
}) => {
    const safeLimit = Math.min(
        Math.max(Number(limit) || 10, 1),
        25
    );

    let products = [];

    /**
     * If an exact product code is provided, use the existing
     * unique-key service.
     */
    if (code) {
        const product = await readByUniqueKeyFunction(code);

        if (product) {
            products = [product];
        }
    } else {
        /**
         * Otherwise use the existing Product read service.
         */
        products = await readFunction();
    }

    const filteredProducts = products
        .filter((product) => matchesSearch(product, search))
        .filter((product) => matchesCategory(product, category))
        .filter((product) => matchesStatus(product, status))
        .slice(0, safeLimit);

    return {
        count: filteredProducts.length,
        products: filteredProducts.map(sanitizeProduct),
    };
};

export default {
    getProducts,
};