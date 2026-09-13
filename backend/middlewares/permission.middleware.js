export const requirePermission = (
    requiredPermissions,
    mode = "any"
) => {
    return (req, res, next) => {
        // console.log("=================================");
        // console.log("PERMISSION CHECK");
        // console.log("AUTH:", req.auth);
        // console.log("REQUIRED:", requiredPermissions);
        // console.log("USER:", req.user);
        // console.log("=================================");

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