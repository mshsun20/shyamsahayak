import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ApiClientSchema = new Schema({
    clientId: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    keyPrefix: { type: String, required: true, index: true, trim: true },
    keyHash: { type: String, required: true, unique: true, index: true },
    apiKey: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["active", "inactive", "revoked"], default: "active", index: true },
    permissions: { type: [String], default: [] },
    description: { type: String, trim: true },
    expiresAt: { type: Date, default: null, index: true },
    lastUsedAt: { type: Date, default: null },
    lastUsedIp: { type: String, default: null },
    lastUserAgent: { type: String, default: null },
}, { timestamps: true });

const ApiClient = model("ApiClient", ApiClientSchema);

export default ApiClient;