import ApiClient from "../models/apiClient.model.js";
import Permission from "../models/permission.model.js";

import {
    generateApiKey,
    hashApiKey,
    getApiKeyPrefix,
} from "../utils/apiKey.util.js";

export const createApiClient = async ({
    clientId,
    name,
    permissions = [],
    description = "",
    expiresAt = null,
}) => {
    const existingClient = await ApiClient.findOne({
        clientId,
    });

    if (existingClient) {
        throw new Error("API client already exists");
    }

    // ------------------------------------------------------------
    // Validate permissions
    // ------------------------------------------------------------

    if (permissions.length > 0) {
        const validPermissions = await Permission.find({
            code: {
                $in: permissions,
            },
            status: "Active",
        }).select("code");

        const validCodes = validPermissions.map(
            (permission) => permission.code
        );

        const missingPermissions = permissions.filter(
            (permission) => !validCodes.includes(permission)
        );

        if (missingPermissions.length > 0) {
            throw new Error(
                `Invalid or inactive permissions: ${missingPermissions.join(", ")}`
            );
        }
    }

    // ------------------------------------------------------------
    // Generate API key
    // ------------------------------------------------------------

    const apiKey = generateApiKey();

    const keyHash = hashApiKey(apiKey);
    const keyPrefix = getApiKeyPrefix(apiKey);

    const client = await ApiClient.create({
        clientId,
        name,
        keyPrefix,
        keyHash,
        permissions,
        description,
        expiresAt,
        status: "active",
    });

    /*
     * IMPORTANT:
     *
     * apiKey is returned only once.
     * The raw key is never stored in MongoDB.
     */

    return {
        client,
        apiKey,
    };
};

export const getApiClients = async () => {
    return ApiClient.find()
        .select("-keyHash")
        .sort({ createdAt: -1 })
        .lean();
};

export const getApiClientById = async (id) => {
    return ApiClient.findById(id)
        .select("-keyHash")
        .lean();
};

export const updateApiClient = async (id, payload) => {
    const allowedFields = [
        "name",
        "description",
        "status",
        "expiresAt",
    ];

    const updateData = {};

    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            updateData[field] = payload[field];
        }
    }

    return ApiClient.findByIdAndUpdate(
        id,
        {
            $set: updateData,
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .select("-keyHash")
        .lean();
};

export const addApiClientPermissions = async (
    id,
    permissions = []
) => {
    if (!permissions.length) {
        throw new Error("At least one permission is required");
    }

    // ------------------------------------------------------------
    // Validate requested permissions
    // ------------------------------------------------------------

    const validPermissions = await Permission.find({
        code: {
            $in: permissions,
        },
        status: "Active",
    }).select("code");

    const validCodes = validPermissions.map(
        (permission) => permission.code
    );

    const missingPermissions = permissions.filter(
        (permission) => !validCodes.includes(permission)
    );

    if (missingPermissions.length > 0) {
        throw new Error(
            `Invalid or inactive permissions: ${missingPermissions.join(", ")}`
        );
    }

    // ------------------------------------------------------------
    // Add permissions without duplicates
    // ------------------------------------------------------------

    return ApiClient.findByIdAndUpdate(
        id,
        {
            $addToSet: {
                permissions: {
                    $each: permissions,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .select("-keyHash")
        .lean();
};

export const removeApiClientPermission = async (
    id,
    permission
) => {
    return ApiClient.findByIdAndUpdate(
        id,
        {
            $pull: {
                permissions: permission,
            },
        },
        {
            new: true,
        }
    )
        .select("-keyHash")
        .lean();
};

export const revokeApiClient = async (id) => {
    return ApiClient.findByIdAndUpdate(
        id,
        {
            $set: {
                status: "revoked",
            },
        },
        {
            new: true,
        }
    )
        .select("-keyHash")
        .lean();
};

export const deleteApiClient = async (id) => {
    return ApiClient.findByIdAndDelete(id);
};