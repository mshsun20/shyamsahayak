import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const SessionSchema = new Schema({
    sessacc: { type: Types.ObjectId, ref: 'Account', required: true },
    userAgent: { type: String, required: true, trim: true },
    ipAddress: { type: String, required: true, trim: true },
    device: { type: String, trim: true },
    location: { type: String, trim: true },
    refreshToken: { type: String, required: true, index: true, trim: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, required: true, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = model('Session', SessionSchema);

export default Session;