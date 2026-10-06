import {
    createConversation,
    createMessage,
    getRequiredConversation,
    generateConversationTitleFromMessage,
} from "../../services/conversation.service.js";


export const registerChatSocket = (io, socket) => {
    socket.on("chat:query", async (payload) => {
        try {
            const message = String(payload?.message || "").trim();
            let conversationId = payload?.conversationId || null;
            if (!message) {
                return socket.emit("chat:error", {
                    success: false,
                    message: "Message is required",
                });
            }
            const userId = socket.auth?.userId;
            if (!userId) {
                return socket.emit("chat:error", {
                    success: false,
                    message: "Authentication required",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Create conversation if this is a new chat
            |--------------------------------------------------------------------------
            */
            if (!conversationId) {
                const conversation = await createConversation({ userId });
                conversationId = conversation.conversationId;
            }

            /*
            |--------------------------------------------------------------------------
            | Verify conversation ownership
            |--------------------------------------------------------------------------
            */
            await getRequiredConversation({ userId, conversationId });

            /*
            |--------------------------------------------------------------------------
            | Save user message
            |--------------------------------------------------------------------------
            */
            const userMessage = await createMessage({
                userId,
                conversationId,
                sender: "user",
                messageType: "text",
                content: message,
            });

            /*
            |--------------------------------------------------------------------------
            | Generate conversation title
            |--------------------------------------------------------------------------
            */
            await generateConversationTitleFromMessage({ userId, conversationId, message });

            /*
            |--------------------------------------------------------------------------
            | Notify frontend that processing started
            |--------------------------------------------------------------------------
            */
            socket.emit("chat:started", {
                success: true,
                conversationId,
                messageId: userMessage.messageId,
            });

            /*
            |--------------------------------------------------------------------------
            | AI processing comes here
            |--------------------------------------------------------------------------
            |
            | Later:
            |
            | const result = await aiOrchestrator(...)
            |
            */
            // AI processing logic codebase will be implemented here in the future.
        } catch (error) {
            console.error("Socket chat query error:", error);
            socket.emit("chat:error", {
                success: false,
                message: error.message || "Unable to process chat request",
            });
        }
    });
};