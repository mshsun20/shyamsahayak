import {
    createConversation,
    getConversationById,
    getRecentConversations,
    getAllConversations,
    getConversationMessages,
    updateConversation,
    archiveConversation,
    restoreConversation,
    deleteConversation,
    getConversationStats,
} from "../services/conversation.service.js";


/**
 * Create a new conversation.
 *
 * POST /api/conversations
 */
const create = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const title = String(
            req.body?.title || "New Conversation"
        ).trim();

        const conversation = await createConversation({
            userId,
            title,
        });

        return res.status(201).json({
            success: true,
            message: "Conversation created successfully",
            data: conversation,
        });

    } catch (error) {
        console.error(
            "Create conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create conversation",
        });
    }
};


/**
 * Get recent active conversations.
 *
 * GET /api/conversations
 *
 * Example:
 * /api/conversations?limit=20
 */
const readRecent = async (req, res) => {
    try {
        const userId = req.user?._id;
        console.log("User ID from auth:", userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const conversations = await getRecentConversations({
            userId,
            limit: req.query.limit,
        });

        return res.status(200).json({
            success: true,
            data: conversations,
        });

    } catch (error) {
        console.error(
            "Get recent conversations error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch conversations",
        });
    }
};


/**
 * Get all conversations.
 *
 * GET /api/conversations/all
 *
 * Includes Active and Archived conversations.
 */
const readAll = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const conversations = await getAllConversations({
            userId,
            limit: req.query.limit,
        });

        return res.status(200).json({
            success: true,
            data: conversations,
        });

    } catch (error) {
        console.error(
            "Get all conversations error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch conversations",
        });
    }
};


/**
 * Get one conversation.
 *
 * GET /api/conversations/:conversationId
 */
const readById = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const conversation = await getConversationById({
            userId,
            conversationId,
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: conversation,
        });

    } catch (error) {
        console.error(
            "Get conversation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch conversation",
        });
    }
};


/**
 * Get messages of a conversation.
 *
 * GET /api/conversations/:conversationId/messages
 */
const readMessages = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const messages = await getConversationMessages({
            userId,
            conversationId,
            limit: req.query.limit,
        });

        return res.status(200).json({
            success: true,
            data: messages,
        });

    } catch (error) {
        console.error(
            "Get conversation messages error:",
            error
        );

        if (error.message === "Conversation not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch conversation messages",
        });
    }
};


/**
 * Update conversation.
 *
 * PATCH /api/conversations/:conversationId
 */
const update = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const conversation = await updateConversation({
            userId,
            conversationId,
            title: req.body?.title,
            status: req.body?.status,
        });

        return res.status(200).json({
            success: true,
            message: "Conversation updated successfully",
            data: conversation,
        });

    } catch (error) {
        console.error(
            "Update conversation error:",
            error
        );

        if (error.message === "Conversation not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        if (
            error.message ===
            "Invalid conversation status"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update conversation",
        });
    }
};


/**
 * Archive conversation.
 *
 * PATCH /api/conversations/:conversationId/archive
 */
const archive = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const conversation = await archiveConversation({
            userId,
            conversationId,
        });

        return res.status(200).json({
            success: true,
            message: "Conversation archived successfully",
            data: conversation,
        });

    } catch (error) {
        console.error(
            "Archive conversation error:",
            error
        );

        if (error.message === "Conversation not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to archive conversation",
        });
    }
};


/**
 * Restore conversation.
 *
 * PATCH /api/conversations/:conversationId/restore
 */
const restore = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const conversation = await restoreConversation({
            userId,
            conversationId,
        });

        return res.status(200).json({
            success: true,
            message: "Conversation restored successfully",
            data: conversation,
        });

    } catch (error) {
        console.error(
            "Restore conversation error:",
            error
        );

        if (error.message === "Conversation not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to restore conversation",
        });
    }
};


/**
 * Delete conversation.
 *
 * DELETE /api/conversations/:conversationId
 */
const remove = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const result = await deleteConversation({
            userId,
            conversationId,
        });

        return res.status(200).json({
            success: true,
            message: "Conversation deleted successfully",
            data: result,
        });

    } catch (error) {
        console.error(
            "Delete conversation error:",
            error
        );

        if (error.message === "Conversation not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete conversation",
        });
    }
};


/**
 * Get conversation statistics.
 *
 * GET /api/conversations/:conversationId/stats
 */
const stats = async (req, res) => {
    try {
        const userId = req.auth?.userId;

        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const result = await getConversationStats({
            userId,
            conversationId,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error(
            "Get conversation stats error:",
            error
        );

        if (error.message === "Conversation not found") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch conversation statistics",
        });
    }
};

const Conversation = {
    create,
    readRecent,
    readAll,
    readById,
    readMessages,
    update,
    archive,
    restore,
    remove,
    stats
};

export default Conversation;