import Account from "../models/account.model.js";
import Session from "../models/session.model.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} from "../utils/tokenGenerator.util.js";
import {
    comparePassword
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
    const accountDetails = {
        _id: account?._id,
        username: account?.username,
        email: account?.email,
        phone: account?.phone,
        fullName: account?.fullName,
        role: account?.role,
        isCreator: account?.isCreator,
        isApprover: account?.isApprover,
        status: account?.status
    }

    return {
        accessToken,
        refreshToken,
        accountDetails
    };
}


// handler functions
export const loginUser = async (accountInfo) => {
    const {
        username,
        password,
        device,
        location,
        userAgent,
        ipAddress
    } = accountInfo;

    const accountDetails = await Account.findOne({
            username
        })
        .populate(['role', 'createdBy', 'updatedBy'])
        .lean();

    const hash = accountDetails?.password ?? "$2b$12$abcdefghijklmnopqrstuv"
    const accValdt = comparePassword(password, hash);

    // console.log(accValdt);

    if (accountDetails && accValdt) {
        const account = await Account.findById(accountDetails._id).select(['-password', '-passwordBackup'])
            .populate(['role', 'createdBy', 'updatedBy'])
            .lean();

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

    const account = await Account.findById(decoded.sessacc).select(['-password', '-passwordBackup'])
        .populate(['role', 'createdBy', 'updatedBy']).lean();
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

    const account = await Account
        .findById(decoded.sessacc)
        .select("-password -passwordBackup");
    if (!account) throw new Error('Account details not found');
    const newAccessToken = generateAccessToken(account);

    return newAccessToken;
};

export const logoutUser = async (refreshToken) => {
    if (refreshToken) {
        const refreshHash = hashGen(refreshToken);
        await Session.deleteMany({
            refreshToken: refreshHash
        });
    }
    return true;
};