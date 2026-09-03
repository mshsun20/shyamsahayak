import express from "express";
const chatRouter = express.Router();
import { chatWithClaude } from "../controllers/chat.controller.js";

chatRouter.post("/", chatWithClaude);

export default chatRouter;