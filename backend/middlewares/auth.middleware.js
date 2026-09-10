import Account from "../models/account.model.js";
import { verifyAccessToken } from "../utils/tokenGenerator.util.js";
import env from "../config/env.js";

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
    
    const adminDtl = await Account.findOne({ username: "smetalics1" })
        .populate([ 'role', 'createdBy', 'updatedBy' ]).lean();

    // ✅ Compare against actual env values
    if (user === username && pass === password) {
        req.user = adminDtl; // Dummy user ID for basic auth
        return next();
    } else {
        return res.status(403).json({ success: false, message: 'Forbidden ..!' });
    }
};


export const jwtHybrdProtect = async (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded || !decoded.sessacc) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        const userDtl = await Account.findById(decoded.sessacc).select(['-password', '-passwordBackup']).populate([ 'role', 'createdBy', 'updatedBy' ]).lean();
        req.user = userDtl;
        next();
    } catch {
        res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};