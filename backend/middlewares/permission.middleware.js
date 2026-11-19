export const requirePermission = (
    requiredPermissions,
    mode = "any"
) => {
    return (req, res, next) => {
        console.log("========== PERMISSION DEBUG ==========");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Method:", req.method);
        console.log("URL:", req.originalUrl);
        console.log("Auth Type:", req.auth?.type);
        console.log("User ID:", req.auth?.userId);
        console.log("Client ID:", req.auth?.clientId);
        console.log("Required Permissions:", requiredPermissions);
        console.log("Granted Permissions:", req.auth?.permissions);
        console.log("======================================");

        if (!req.auth) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
        const userPermissions = req.auth.permissions || [];
        const hasPermission = mode === "all"
            ? required.every((permission) => userPermissions.includes(permission))
            : required.some((permission) => userPermissions.includes(permission));

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            });
        }

        next();
    };
};