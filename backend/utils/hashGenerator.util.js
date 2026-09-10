import crypto from "crypto";

export const hashGen = (data) => {
    return crypto.createHash("sha256").update(data).digest("hex");
}