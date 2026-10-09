import express from "express";
const conversationRouter = express.Router();
import Conversation from "../controllers/conversation.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";



/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Every conversation endpoint requires an authenticated user.
|
*/
conversationRouter.use(unifiedAuthProtect);

/*
|--------------------------------------------------------------------------
| Conversation
|--------------------------------------------------------------------------
*/
/**
 * Create new conversation
 */
conversationRouter.post("/", Conversation.create);

/**
 * Get recent active conversations
 */
conversationRouter.get("/", Conversation.readRecent);

/**
 * Get all conversations
 */
conversationRouter.get("/all", Conversation.readAll);

/*
|--------------------------------------------------------------------------
| Conversation-specific routes
|--------------------------------------------------------------------------
*/
/**
 * Get conversation messages
 */
conversationRouter.get("/:conversationId/messages", Conversation.readMessages);

/**
 * Get conversation statistics
 */
conversationRouter.get("/:conversationId/stats", Conversation.stats);

/**
 * Get conversation
 */
conversationRouter.get("/:conversationId", Conversation.readById);

/**
 * Archive conversation
 */
conversationRouter.patch("/:conversationId/archive", Conversation.archive);

/**
 * Restore conversation
 */
conversationRouter.patch("/:conversationId/restore", Conversation.restore);

/**
 * Update conversation
 */
conversationRouter.patch("/:conversationId", Conversation.update);

/**
 * Delete conversation
 */
conversationRouter.delete("/:conversationId", Conversation.remove);


export default conversationRouter;