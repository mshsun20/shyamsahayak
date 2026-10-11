import Conversation from "../models/conversation.model.js";
import ConversationMessage from "../models/conversationMessage.model.js";
import crypto from "crypto";



/**
 * Generate a unique conversation ID.
 */
const generateConversationId = () => `CONV-${crypto.randomUUID()}`;

/**
 * Generate a unique message ID.
 */
const generateMessageId = () => `MSG-${crypto.randomUUID()}`;

/**
 * Safely normalize pagination limit.
 */
const normalizeLimit = (value, defaultLimit, maxLimit) => {
    const parsedLimit = Number(value);
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) return defaultLimit;
    return Math.min(Math.floor(parsedLimit), maxLimit);
};

/**
 * Generate a conversation title from the first user message.
 *
 * This avoids an additional Claude request just to generate a title.
 */
const generateConversationTitle = (message) => {
    if (!message || typeof message !== "string") return "New Conversation";
    const title = message.replace(/\s+/g, " ").trim();
    if (!title) return "New Conversation";
    const maxLength = 70;
    if (title.length <= maxLength) return title;
    return `${title.substring(0, maxLength).trim()}...`;
};


/**
 * Create a new conversation.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} [params.title]
 *
 * @returns {Promise<Object>}
 */
export const createConversation = async ({
    userId,
    title = "New Conversation"
}) => {
    if (!userId) throw new Error("User ID is required");
    const conversation = await Conversation.create({
        conversationId: generateConversationId(),
        user: userId,
        title: title?.trim() || "New Conversation",
        status: "Active",
        lastMessageAt: new Date(),
        messageCount: 0,
    });
    return conversation;
};


/**
 * Get a conversation belonging to the authenticated user.
 *
 * IMPORTANT:
 * conversationId alone is never sufficient.
 * Ownership is always checked using userId.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 *
 * @returns {Promise<Object|null>}
 */
export const getConversationById = async ({
    userId,
    conversationId
}) => {
    if (!userId) throw new Error("User ID is required");
    if (!conversationId) throw new Error("Conversation ID is required");
    return Conversation.findOne({
        conversationId,
        user: userId
    }).lean();
};


/**
 * Get a conversation belonging to the authenticated user.
 *
 * Throws an error if the conversation does not exist.
 */
export const getRequiredConversation = async ({
    userId,
    conversationId
}) => {
    const conversation = await getConversationById({
        userId,
        conversationId
    });
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
};


/**
 * Create a conversation message.
 *
 * The conversation must:
 * 1. Exist.
 * 2. Belong to the authenticated user.
 * 3. Be Active.
 *
 * This prevents a user from inserting messages into another
 * user's conversation by simply providing a conversation ID.
 *
 * @param {Object} params
 */
export const createMessage = async ({
    userId,
    conversationId,
    sender,
    messageType,
    content = null,
    response = null,
    metadata = null,
}) => {
    if (!userId) throw new Error("User ID is required");
    if (!conversationId) throw new Error("Conversation ID is required");
    if (!sender) throw new Error("Message sender is required");
    if (!messageType) throw new Error("Message type is required");
    const conversation = await Conversation.findOne({
        conversationId,
        user: userId
    });

    if (!conversation) throw new Error("Conversation not found");
    if (conversation.status !== "Active") throw new Error("Conversation is archived");
    const message = await ConversationMessage.create({
        messageId: generateMessageId(),
        conversation: conversation._id,
        sender,
        messageType,
        content,
        response,
        metadata,
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
        $inc: {
            messageCount: 1
        },
        $set: {
            lastMessageAt: message.createdAt
        },
    }, { returnDocument: "before" });

    return message;
};


/**
 * Get recent active conversations for a user.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {number} [params.limit=20]
 *
 * @returns {Promise<Array>}
 */
export const getRecentConversations = async ({
    userId,
    limit = 20
}) => {
    if (!userId) throw new Error("User ID is required");
    const safeLimit = normalizeLimit(limit, 20, 50);
    return Conversation.find({
        user: userId,
        status: "Active"
    }).select([
        "_id",
        "conversationId",
        "title",
        "status",
        "lastMessageAt",
        "messageCount",
        "createdAt",
        "updatedAt",
    ]).sort({
        lastMessageAt: -1
    }).limit(safeLimit).lean();
};


/** * ========================================================== * CREATE CONVERSATION + FIRST USER MESSAGE * ========================================================== * * This is the important new method. * * The frontend sends: * * conversationId: null * message: "Show me all published products" * * Backend creates: * * CONV-xxxxx * MSG-xxxxx * * and returns the public conversation ID. * ========================================================== */
export const createConversationWithMessage = async ({
    userId,
    message,
    metadata = null,
}) => {
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!message || typeof message !== "string") {
        throw new Error("Message is required");
    }
    const normalizedMessage = message.replace(/\s+/g, " ").trim();
    if (!normalizedMessage) {
        throw new Error("Message cannot be empty");
    }
    const title = generateConversationTitle(normalizedMessage);
    const conversation = await Conversation.create({
        conversationId: generateConversationId(),
        user: userId,
        title,
        status: "Active",
        lastMessageAt: new Date(),
        messageCount: 0,
    });
    const userMessage = await ConversationMessage.create({
        messageId: generateMessageId(),
        conversation: conversation._id,
        sender: "user",
        messageType: "text",
        content: normalizedMessage,
        metadata,
    });
    await Conversation.findByIdAndUpdate(conversation._id, {
        $inc: {
            messageCount: 1,
        },
        $set: {
            lastMessageAt: userMessage.createdAt,
        },
    });
    return {
        conversation,
        message: userMessage,
    };
};


/**
 * Get all conversations for a user.
 *
 * This includes both Active and Archived conversations.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {number} [params.limit=50]
 *
 * @returns {Promise<Array>}
 */
export const getAllConversations = async ({
    userId,
    limit = 50
}) => {
    if (!userId) throw new Error("User ID is required");
    const safeLimit = normalizeLimit(limit, 50, 100);
    return Conversation.find({
        user: userId
    }).select([
        "_id",
        "conversationId",
        "title",
        "status",
        "lastMessageAt",
        "messageCount",
        "createdAt",
        "updatedAt",
    ]).sort({
        lastMessageAt: -1
    }).limit(safeLimit).lean();
};


/**
 * Get messages belonging to a conversation.
 *
 * Ownership is verified before messages are returned.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 * @param {number} [params.limit=50]
 *
 * @returns {Promise<Array>}
 */

export const getConversationMessages = async ({
    userId,
    conversationId,
    limit = 50,
}) => {
    const conversation = await getRequiredConversation({ userId, conversationId });
    const safeLimit = normalizeLimit(limit, 50, 100);
    const messages = await ConversationMessage.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(safeLimit).lean();

    // The query retrieves the latest messages first.
    // Reverse them so the chat displays oldest to newest.
    return messages.reverse();
};



/**
 * Get recent conversation messages for AI context.
 *
 * Unlike getConversationMessages(), this method is intended
 * specifically for sending recent context to Claude.
 *
 * The latest messages are fetched first and then reversed
 * so Claude receives them in chronological order.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 * @param {number} [params.limit=20]
 *
 * @returns {Promise<Array>}
 */
export const getConversationContext = async ({
    userId,
    conversationId,
    limit = 20
}) => {
    const conversation = await getRequiredConversation({
        userId,
        conversationId
    });
    const safeLimit = normalizeLimit(limit, 20, 50);
    const messages = await ConversationMessage.find({
        conversation: conversation._id
    }).sort({
        createdAt: -1
    }).limit(safeLimit).select([
        "messageId",
        "sender",
        "messageType",
        "content",
        "response",
        "createdAt",
    ]).lean();
    return messages.reverse();
};


/**
 * Update conversation details.
 *
 * Currently supports:
 * - title
 * - status
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 * @param {string} [params.title]
 * @param {string} [params.status]
 *
 * @returns {Promise<Object>}
 */
export const updateConversation = async ({
    userId,
    conversationId,
    title,
    status
}) => {
    if (!userId) throw new Error("User ID is required");
    if (!conversationId) throw new Error("Conversation ID is required");
    const updateData = {};
    if (typeof title === "string") {
        const normalizedTitle = title.replace(/\s+/g, " ").trim();
        if (normalizedTitle) {
            updateData.title = normalizedTitle;
        }
    }
    if (status !== undefined) {
        if (!["Active", "Archived"].includes(status)) throw new Error("Invalid conversation status");
        updateData.status = status;
    }
    if (Object.keys(updateData).length === 0) throw new Error("No conversation data provided for update");
    const conversation = await Conversation.findOneAndUpdate({ conversationId, user: userId }, {
        $set: updateData
    }, { returnDocument: "after" }).lean();
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
};


/**
 * Archive a conversation.
 *
 * The conversation remains in MongoDB and can still be
 * retrieved from conversation history.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 *
 * @returns {Promise<Object>}
 */
export const archiveConversation = async ({
    userId,
    conversationId
}) => {
    return updateConversation({
        userId,
        conversationId,
        status: "Archived"
    });
};


/**
 * Restore an archived conversation.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 *
 * @returns {Promise<Object>}
 */
export const restoreConversation = async ({
    userId,
    conversationId
}) => {
    return updateConversation({
        userId,
        conversationId,
        status: "Active"
    });
};


/**
 * Update conversation title.
 *
 * Useful when the first user message is received.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 * @param {string} params.title
 *
 * @returns {Promise<Object>}
 */
export const updateConversationTitle = async ({
    userId,
    conversationId,
    title
}) => {
    return updateConversation({
        userId,
        conversationId,
        title
    });
};


/**
 * Automatically create/update a conversation title
 * from the first user message.
 *
 * Example:
 *
 * "Show me all published products"
 *
 * becomes:
 *
 * "Show me all published products"
 *
 * @param {Object} params
 */
export const generateConversationTitleFromMessage = async ({
    userId,
    conversationId,
    message
}) => {
    const conversation = await getRequiredConversation({
        userId,
        conversationId
    });

    /**
     * Only generate a title when the conversation still
     * has the default title.
     */
    if (conversation.title && conversation.title !== "New Conversation") return conversation;
    const title = generateConversationTitle(message);

    return updateConversationTitle({
        userId,
        conversationId,
        title
    });
};


/**
 * Delete a conversation and all of its messages.
 *
 * This performs a hard delete.
 *
 * IMPORTANT:
 * Only the authenticated user's own conversation
 * can be deleted.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 *
 * @returns {Promise<Object>}
 */
export const deleteConversation = async ({
    userId,
    conversationId
}) => {
    const conversation = await Conversation.findOne({
        conversationId,
        user: userId
    });
    if (!conversation) throw new Error("Conversation not found");
    await ConversationMessage.deleteMany({
        conversation: conversation._id
    });
    await Conversation.deleteOne({
        _id: conversation._id,
    });
    return {
        success: true,
        conversationId
    };
};


/**
 * Get conversation statistics.
 *
 * Useful for administration/debugging and future analytics.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|string} params.userId
 * @param {string} params.conversationId
 *
 * @returns {Promise<Object>}
 */
export const getConversationStats = async ({
    userId,
    conversationId
}) => {
    const conversation = await getRequiredConversation({
        userId,
        conversationId
    });
    const conversationMessagePipeline = [{
            $match: {
                conversation: conversation._id
            }
        },
        {
            $group: {
                _id: "$sender",
                count: {
                    $sum: 1
                },
            }
        },
    ]
    const [messageCount, senderStats] = await Promise.all([
        ConversationMessage.countDocuments({
            conversation: conversation._id
        }),
        ConversationMessage.aggregate(conversationMessagePipeline),
    ]);
    const stats = {
        user: 0,
        assistant: 0,
        system: 0
    };
    senderStats.forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(stats, item._id)) {
            stats[item._id] = item.count;
        }
    });

    return {
        conversationId: conversation.conversationId,
        title: conversation.title,
        status: conversation.status,
        messageCount,
        messagesBySender: stats,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        lastMessageAt: conversation.lastMessageAt,
    };
};