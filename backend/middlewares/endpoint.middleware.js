export const requireClient = (clientId) => {
    return (req, res, next) => {
        if (req.auth?.type !== "api-key" || req.auth.clientId !== clientId) {
            return res.status(403).json({
                success: false,
                message: "Client not authorized for this endpoint",
            });
        }

        next();
    };
};