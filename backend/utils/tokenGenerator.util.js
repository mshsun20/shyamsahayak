import jwt from 'jsonwebtoken';
import env from "../config/env.js";


// tokens generation
export const generateAccessToken = (user) => {
    return jwt.sign({ sessacc: user._id }, env.jwtAccess, { expiresIn: `${env.accessExpiry}m` });
};

export const generateRefreshToken = (user) => {
    return jwt.sign({ sessacc: user._id }, env.jwtRefresh, { expiresIn: `${env.refreshExpiry}d` });
};



// tokens verification
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.jwtAccess);
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.jwtRefresh);
};
