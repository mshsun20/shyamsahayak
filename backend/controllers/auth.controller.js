import {
    loginUser,
    checkSession,
    regenerateToken,
    changePasswordFunction,
    logoutUser,
    accessCookieOptions,
    refreshCookieOptions
} from "../services/auth.service.js";
import {
    hashPassword,
    comparePassword,
} from "../utils/passwordHash.util.js";

const login = async (req, res) => {
    try {
        const accountInfo = req.body;
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip;
        // const url = req.get("referer") || null;
        // const client = accountInfo?.client
        // console.log(client);
        const cookieSecure = req.secure;

        Object.assign(accountInfo, { userAgent, ipAddress })
        const verifiedData = await loginUser(accountInfo);
        res.cookie("access_token", verifiedData.accessToken, { ...accessCookieOptions, secure: cookieSecure });
        res.cookie("refresh_token", verifiedData.refreshToken, { ...refreshCookieOptions, secure: cookieSecure });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: verifiedData.accountDetails
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const checkAuth = async (req, res) => {
    try {
        const accessToken = req.cookies.access_token;
        const accountDetails = await checkSession(accessToken);
        res.status(200).json({
            success: true,
            message: 'Session is valid',
            data: accountDetails
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: error.message || "Not authenticated" });
    }
};

const regenerateAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        const newAccessToken = await regenerateToken(refreshToken);
        // console.log(verifiedData);
        
        res.cookie("access_token", newAccessToken, { ...accessCookieOptions, secure: req.secure });
        res.status(200).json({
            success: true,
            message: 'Access Token regenerated successfully',
            data: newAccessToken
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: error.message || "Unable to regenerate access token" });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        await logoutUser(refreshToken);
        res.clearCookie("access_token", { ...accessCookieOptions, secure: req.secure });
        res.clearCookie("refresh_token", { ...refreshCookieOptions, secure: req.secure });
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const accountPayload = req.body
        const user = req.user || null;
        const accessToken = req.cookies.access_token;
        const accountDetails = await checkSession(accessToken);
        const hash = accountDetails?.password ?? "$2b$12$abcdefghijklmnopqrstuv"
        const accValdt = comparePassword(accountPayload?.current, hash);
        if (accValdt) {
            const accountInfo = {}
            Object.assign(accountInfo, {
                password: hashPassword(accountPayload?.next),
                passwordBackup: accountPayload?.next,
                passwordChangeFlag: false,
                status: "Active",
                updatedBy: user?._id,
            })
            const chnagePasswordResult = await changePasswordFunction(accountDetails?._id, accountInfo);
            if (chnagePasswordResult) {
                res.status(201).json({
                    success: true,
                    message: "Password changed successfully"
                })
            }
            else {
                res.status(401).json({
                    success: false,
                    message: "Password changing failed"
                })
            }
        }
        else {
            throw new Error('Wrong password provided');
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
}

const Auth = { login, checkAuth, regenerateAccessToken, logout, changePassword };

export default Auth;