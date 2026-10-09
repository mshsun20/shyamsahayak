import { runAI } from "../../ai/orchestrator/ai.orchestrator.js";
import {
    createConversation,
    createMessage,
    getRequiredConversation,
    getConversationContext,
    generateConversationTitleFromMessage,
} from "../../services/conversation.service.js";

const MAX_MESSAGE_LENGTH = 10000;
const MAX_CONTEXT_MESSAGES = 20;

export const registerChatSocket = (io, socket) => {
    console.log("[CHAT] Registering handler for socket:", socket.id);

    socket.on("chat:query", async (payload = {}, acknowledge) => {
        let conversationId = null;
        
        try {
            console.log("[CHAT] Received chat:query:", {
                socketId: socket.id,
                message: payload.message,
            });

            if (typeof acknowledge === "function") {
                acknowledge({ received: true, socketId: socket.id });
            }
            // Always derive identity from authenticated socket.
            const userId = socket.auth?.userId;
            console.log("User Details:: ", userId);
            if (!userId) {
                socket.emit("chat:error", {
                    success: false,
                    message: "Authentication required",
                });
                return;
            }

            const message = typeof payload.message === "string" ? payload.message.trim() : "";
            conversationId = payload.conversationId || null;
            if (!message) {
                socket.emit("chat:error", {
                    success: false,
                    message: "Message is required",
                });
                return;
            }

            if (message.length > MAX_MESSAGE_LENGTH) {
                socket.emit("chat:error", {
                    success: false,
                    message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
                });
                return;
            }

            /*
             * 1. Create or validate the conversation.
             */
            if (!conversationId) {
                const conversation = await createConversation({ userId });
                conversationId = conversation.conversationId;
            }
            const conversation = await getRequiredConversation({ userId, conversationId });
            if (conversation.status !== "Active") throw new Error("Conversation is archived");

            /*
             * 2. Persist the user message.
             */
            const userMessage = await createMessage({
                userId,
                conversationId,
                sender: "user",
                messageType: "text",
                content: message,
            });

            await generateConversationTitleFromMessage({ userId, conversationId, message });

            socket.emit("chat:started", {
                success: true,
                conversationId,
                messageId: userMessage.messageId,
            });

            /*
             * 3. Load conversation history for Claude.
             *
             * The service returns chronological messages.
             * The current user message is already persisted,
             * so do not pass it separately to runAI().
             */
            const history = await getConversationContext({ userId, conversationId, limit: MAX_CONTEXT_MESSAGES });
            const messages = history.filter((item) => ["user", "assistant"].includes(item.sender)).map((item) => ({
                role: item.sender,
                content: item.content ?? item.response ?? "",
            })).filter((item) => {
                return typeof item.content === "string" ? item.content.trim().length > 0 : Array.isArray(item.content);
            });

            /*
             * 4. Execute AI with trusted server-side context.
             */
            const result = await runAI({
                messages,
                context: {
                    userId: String(userId),
                    permissions: socket.auth.permissions,
                },
            });
            if (result.type !== "final" || typeof result.text !== "string" || !result.text.trim()) throw new Error("The AI did not return a valid response");

            /*
             * 5. Persist the assistant response.
             */
            const assistantMessage = await createMessage({
                userId,
                conversationId,
                sender: "assistant",
                messageType: "text",
                content: result.text,
                metadata: {
                    source: "ai",
                    stopReason: result.stopReason,
                    toolRounds: result.toolRounds,
                    usage: result.usage,
                },
            });

            /*
             * 6. Return the completed response to this socket.
             */
            socket.emit("chat:completed", {
                success: true,
                conversationId,
                userMessageId: userMessage.messageId,
                messageId: assistantMessage.messageId,
                message: result.text,
                usage: result.usage,
            });
        } catch (error) {
            console.error("Socket chat query error:", error);
            socket.emit("chat:error", {
                success: false,
                conversationId,
                message: error.message || "Unable to process chat request",
            });
        }
    });
};
