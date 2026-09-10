import crypto from "crypto";


export const generateOtp = (digits=6) => {
    const min = 10 ** (digits - 1);
    const max = (10 ** digits) - 1;

    return crypto.randomInt(min, max).toString();
}

export const hashOtp = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
}

export const verifyOTP = (otp, storedHash) => {
    return hashOtp(otp) === storedHash
}