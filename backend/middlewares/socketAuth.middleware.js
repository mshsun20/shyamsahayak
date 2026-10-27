import { parseCookie } from "cookie";
import Account from "../models/account.model.js";
import { verifyAccessToken } from "../utils/tokenGenerator.util.js";
import { getEffectivePermissions } from "../services/authorization.service.js";

const socketAuth = async (socket, next) => {
    try {
        // ===== // 1. Read cookies from Socket.IO handshake // =====
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) return next(new Error("Authentication required"));

        // ===== // 2. Parse cookies // =====
        const cookies = parseCookie(cookieHeader);
        // console.log(cookies);
        const accessToken = cookies.access_token;
        // console.log(accessToken);
        if (!accessToken) return next(new Error("Authentication required"));

        // ===== // 3. Verify access token // =====
        const decoded = verifyAccessToken(accessToken);
        if (!decoded || !decoded.sessacc) {
            return next(new Error("Invalid or expired access token"));
        }

        const userDtl = await Account.findById(decoded.sessacc)
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
        ])
        .populate({ path: "reportingManagers", select: "-password -passwordBackup" })
        .populate({ path: "createdBy", select: "-password -passwordBackup" })
        .populate({ path: "updatedBy", select: "-password -passwordBackup" })
        .lean();

        if (!userDtl) {
            return next(new Error("User account not found"));
        }

        const effectivePermissions = getEffectivePermissions(userDtl);
        socket.user = userDtl;
        socket.auth = {
            type: "jwt",
            userId: userDtl._id,
            permissions: effectivePermissions,
        };

        /*
         * Store the JWT expiry on the socket.
         *
         * JWT exp is in seconds.
         */
        socket.auth.expiresAt = decoded.exp ? decoded.exp * 1000 : null;
        return next();
    } catch (error) {
        console.error("Socket authentication error:", error.message);
        next(new Error("Authentication failed"));
    }
}

export default socketAuth;