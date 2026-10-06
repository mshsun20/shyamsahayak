import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const ConversationMessageSchema = new Schema({
    messageId: { type: String, required: true, unique: true, index: true, trim: true },
    conversation: { type: Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: String, required: true, enum: ["user", "assistant", "system"] },
    messageType: { type: String, required: true, enum: ["text", "ai_response", "error", "system"], default: "text" },
    content: { type: String, trim: true },
    response: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

ConversationMessageSchema.index({ conversation: 1, createdAt: 1 });

const ConversationMessage = model("ConversationMessage", ConversationMessageSchema);
export default ConversationMessage;