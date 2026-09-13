import Account from "../models/account.model.js";
import { verifyAccessToken } from "../utils/tokenGenerator.util.js";
import env from "../config/env.js";
import ApiClient from "../models/apiClient.model.js";
import { hashApiKey } from "../utils/apiKey.util.js";
import { getEffectivePermissions } from "../services/authorization.service.js";

const username = env.apiUsr || 'digitalapi'
const password = env.apiPss || 'Shyam@12345'

export const basicAuth = async (req, res, next) => {
    const method = req.method;
    const contentType = req.headers['content-type'] || '';
    const accept = req.headers['accept'] || '';
    const xRequestedWith = req.headers['x-requested-with'] || '';
    const authHeader = req.headers.authorization;

    // ✅ All headers checks
    if (
        !accept.toLowerCase().includes('application/json') ||
        xRequestedWith.toLowerCase() !== 'x' ||
        (['POST', 'PUT', 'PATCH'].includes(method) && !contentType.toLowerCase().includes('application/json'))
    ) {
        return res.status(401).json({ success: false, message: 'Invalid or missing headers' });
    }

    // ✅ Authorization must be present
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Authorization header missing!' });
    }

    const [scheme, credentials] = authHeader.split(' ');
    if (scheme !== 'Basic' || !credentials) {
        return res.status(401).json({ success: false, message: 'Invalid authorization format!' });
    }

    // ✅ Decode credentials
    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
    const [user, pass] = decodedCredentials.split(':');
    
    const adminDtl = await Account.findOne({ username: "smetalicsSA" })
        .populate([
            {
                path: "role",
                populate: {
                    path: "permissions",
                    select: "code name module action status",
                },
            },
            {
                path: "privilege",
                populate: {
                    path: "permissions",
                    select: "code name module action status",
                },
            },
            {
                path: "permissions",
                select: "code name module action status",
            },
            "createdBy",
            "updatedBy",
        ]).lean();

    // ✅ Compare against actual env values
    if (user === username && pass === password) {
        req.user = adminDtl;
        const effectivePermissions = getEffectivePermissions(adminDtl);
        req.auth = {
            type: "basic",
            userId: adminDtl?._id,
            permissions: effectivePermissions,
        };

        console.log("Basic Auth used");
        return next();
    } else {
        return res.status(403).json({ success: false, message: 'Forbidden ..!' });
    }
};

export const jwtHybridProtect = async (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized",
        });
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded || !decoded.sessacc) {
            return res.status(403).json({
                success: false,
                message: "Invalid token",
            });
        }

        const userDtl = await Account.findById(decoded.sessacc)
            .select(["-password", "-passwordBackup"])
            .populate([
                {
                    path: "role",
                    populate: {
                        path: "permissions",
                        select: "code name module action status",
                    },
                },
                {
                    path: "privilege",
                    populate: {
                        path: "permissions",
                        select: "code name module action status",
                    },
                },
                {
                    path: "permissions",
                    select: "code name module action status",
                },
                "createdBy",
                "updatedBy",
            ])
            .lean();

        if (!userDtl) {
            return res.status(401).json({
                success: false,
                message: "User account not found",
            });
        }

        req.user = userDtl;
        const effectivePermissions = getEffectivePermissions(userDtl);
        req.auth = {
            type: "jwt",
            userId: userDtl._id,
            permissions: effectivePermissions,
        };

        console.log("JWT Hybrid Protect used");
        return next();
    } catch {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const bearerApiKeyProtect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing!",
        });
    }

    const [scheme, token] = authHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Invalid Bearer authorization format!",
        });
    }

    try {
        const keyHash = hashApiKey(token);
        const client = await ApiClient.findOne({ keyHash, status: "active" }).lean();
        if (!client) {
            return res.status(403).json({
                success: false,
                message: "Invalid or revoked API key",
            });
        }

        // Check expiration
        if (client.expiresAt && new Date(client.expiresAt) <= new Date()) {
            return res.status(403).json({
                success: false,
                message: "API key expired",
            });
        }

        /*
         * Attach integration information to request.
         */
        req.auth = {
            type: "api-key",
            clientId: client.clientId,
            clientName: client.name,
            permissions: client.permissions || [],
        };

        req.apiClient = client;

        /*
         * Update usage asynchronously.
         *
         * Do not make this block the API request.
         */
        ApiClient.updateOne({ _id: client._id }, {
            $set: {
                lastUsedAt: new Date(),
                lastUsedIp: req.ip || req.headers["x-forwarded-for"] || null,
                lastUserAgent: req.headers["user-agent"] || null,
            },
        }).catch((error) => {
            console.error("API client usage update failed:", error);
        });

        console.log("Bearer Token used");
        return next();
    } catch (error) {
        console.error("Bearer authentication error:", error);
        return res.status(403).json({
            success: false,
            message: "Invalid API key",
        });
    }
};


// =================================================================================================
// THE UNIFIED AUTH PROTECTOR
// =================================================================================================

export const unifiedAuthProtect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // --------------------------------------------
    // Bearer API Key
    // --------------------------------------------
    if (authHeader && /^Bearer\s+/i.test(authHeader)) {
        return bearerApiKeyProtect(req, res, next);
    }

    // --------------------------------------------
    // Basic Authentication
    // --------------------------------------------
    if (authHeader && /^Basic\s+/i.test(authHeader)) {
        return basicAuth(req, res, next);
    }

    // --------------------------------------------
    // JWT Cookie
    // --------------------------------------------
    if (req.cookies?.access_token) {
        return jwtHybridProtect(req, res, next);
    }

    return res.status(401).json({
        success: false,
        message: "Authentication required",
    });
};