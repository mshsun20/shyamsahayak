import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} from "../utils/tokenGenerator.util.js";
import Account from "../models/account.model.js";
import {
    readByIdFunction
} from "../services/account.service.js";
import { getEffectivePermissions } from "../services/authorization.service.js";
import Session from "../models/session.model.js";
import {
    comparePassword,
} from "../utils/passwordHash.util.js";
import {
    hashGen
} from "../utils/hashGenerator.util.js";
import env from "../config/env.js";


let accessTokenExpiryTTL = parseInt(env.accessExpiry) * 60 * 1000;
let refreshTokenExpiryTTL = parseInt(env.refreshExpiry) * 24 * 60 * 60 * 1000;
export const accessCookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "Strict",
    maxAge: accessTokenExpiryTTL,
};
export const refreshCookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "Strict",
    maxAge: refreshTokenExpiryTTL,
};

// reusable functions
export const generateSession = async (account, device, location, userAgent, ipAddress) => {
    const accessToken = generateAccessToken(account);
    const refreshToken = generateRefreshToken(account);

    const refreshHash = hashGen(refreshToken)

    await Session.create({
        sessacc: account._id,
        userAgent,
        ipAddress,
        device,
        location,
        refreshToken: refreshHash,
        expiresAt: new Date(Date.now() + refreshTokenExpiryTTL)
    });
    const allPermissions = getEffectivePermissions(account);
    const accountDetails = {
        _id: account?._id,
        userId: account?.userId,
        username: account?.username,
        employeeId: account?.employeeId,
        passwordChangeFlag: account?.passwordChangeFlag,
        reportingDetails: account?.reportingDetails?.map(arep => arep),
        email: account?.email,
        phone: account?.phone,
        fullName: account?.fullName,
        role: account?.role,
        privilege: account?.privilege,
        remarks: account?.remarks,
        status: account?.status,
        allPermissions
    }

    return {
        accessToken,
        refreshToken,
        accountDetails,
    };
}


// handler functions
export const loginUser = async (accountInfo) => {
    let userId
    const { password, device, location, userAgent, ipAddress } = accountInfo;
    if (accountInfo.username) {
        userId = accountInfo.username;
    }
    else {
        userId = accountInfo.employeeId;
    }
    // console.log(userId);
    const accountDetails = await Account.findOne({ userId })
    // console.log(accountDetails);
    const hash = accountDetails?.password ?? "$2b$12$abcdefghijklmnopqrstuv"
    const accValdt = comparePassword(password, hash);

    // console.log(accValdt);

    if (accountDetails && accValdt) {
        const account = await readByIdFunction(accountDetails._id);
        const verifiedData = await generateSession(
            account, device, location, userAgent, ipAddress
        );
        return verifiedData;
    } else {
        throw new Error('Invalid username or password');
    }
}

export const checkSession = async (accessToken) => {
    if (!accessToken) throw new Error('Not authenticated');

    const decoded = verifyAccessToken(accessToken);
    const session = await Session.findOne({
        sessacc: decoded.sessacc
    });
    if (!session) throw new Error('Session expired');
    
    const account = await readByIdFunction(decoded.sessacc);
    if (!account) throw new Error('Account details not found');
    return account;
};

export const regenerateToken = async (refreshToken) => {
    if (!refreshToken) throw new Error('No token provided');

    const decoded = verifyRefreshToken(refreshToken);
    const refreshHash = hashGen(refreshToken)
    const session = await Session.findOne({
        sessacc: decoded.sessacc,
        refreshToken: refreshHash
    });
    if (!session) throw new Error('Invalid session');

    const account = await readByIdFunction(decoded.sessacc);
    if (!account) throw new Error('Account details not found');
    const newAccessToken = generateAccessToken(account);
    return newAccessToken;
};

export const logoutUser = async (refreshToken) => {
    if (refreshToken) {
        const refreshHash = hashGen(refreshToken);
        await Session.deleteMany({ refreshToken: refreshHash });
    }
    return true;
};

export const changePasswordFunction = async (id, payload) => {
    const accountUpdated = await Account.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    if (accountUpdated) {
        return true;
    }
}