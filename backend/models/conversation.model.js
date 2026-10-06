import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const ConversationSchema = new Schema({
    conversationId: { type: String, required: true, unique: true, index: true, trim: true },
    user: { type: Types.ObjectId, ref: "Account", required: true, index: true },
    title: { type: String, trim: true, default: "New Conversation" },
    status: { type: String, enum: ["Active", "Archived"], default: "Active", index: true },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    messageCount: { type: Number, default: 0 },
}, { timestamps: true });

ConversationSchema.index({ user: 1, status: 1, lastMessageAt: -1 });

const Conversation = model("Conversation", ConversationSchema);
export default Conversation;
