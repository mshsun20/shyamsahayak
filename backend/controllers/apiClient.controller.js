import {
    createApiClient,
    getApiClients,
    getApiClientById,
    updateApiClient,
    addApiClientPermissions,
    removeApiClientPermission,
    revokeApiClient,
    deleteApiClient,
} from "../services/apiClient.service.js";

const create = async (req, res) => {
    try {
        const {
            clientId,
            name,
            permissions = [],
            description = "",
            expiresAt = null,
        } = req.body;

        const result = await createApiClient({
            clientId,
            name,
            permissions,
            description,
            expiresAt,
        });

        return res.status(201).json({
            success: true,
            message: "API client created successfully",
            data: {
                client: result.client,
                apiKey: result.apiKey,
            },
        });
    } catch (error) {
        console.error("Create API client error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message || "Failed to create API client",
        });
    }
};

const read = async (req, res) => {
    try {
        const clients = await getApiClients();

        return res.status(200).json({
            success: true,
            data: clients,
        });
    } catch (error) {
        console.error("Read API clients error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch API clients",
        });
    }
};

const readById = async (req, res) => {
    try {
        const client = await getApiClientById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "API client not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: client,
        });
    } catch (error) {
        console.error("Read API client error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch API client",
        });
    }
};

const update = async (req, res) => {
    try {
        const client = await updateApiClient(
            req.params.id,
            req.body
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "API client not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "API client updated successfully",
            data: client,
        });
    } catch (error) {
        console.error("Update API client error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message || "Failed to update API client",
        });
    }
};

const addPermissions = async (req, res) => {
    try {
        const { permissions } = req.body;

        const client = await addApiClientPermissions(
            req.params.id,
            permissions
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "API client not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Permissions added successfully",
            data: client,
        });
    } catch (error) {
        console.error(
            "Add API client permissions error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to add API client permissions",
        });
    }
};

const removePermission = async (req, res) => {
    try {
        const { permission } = req.body;

        const client = await removeApiClientPermission(
            req.params.id,
            permission
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "API client not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Permission removed successfully",
            data: client,
        });
    } catch (error) {
        console.error(
            "Remove API client permission error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to remove API client permission",
        });
    }
};

const revoke = async (req, res) => {
    try {
        const client = await revokeApiClient(
            req.params.id
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "API client not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "API client revoked successfully",
            data: client,
        });
    } catch (error) {
        console.error("Revoke API client error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to revoke API client",
        });
    }
};

const remove = async (req, res) => {
    try {
        const client = await deleteApiClient(
            req.params.id
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "API client not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "API client deleted successfully",
        });
    } catch (error) {
        console.error("Delete API client error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete API client",
        });
    }
};

const ApiClient = {
    create,
    read,
    readById,
    update,
    addPermissions,
    removePermission,
    revoke,
    remove
}

export default ApiClient