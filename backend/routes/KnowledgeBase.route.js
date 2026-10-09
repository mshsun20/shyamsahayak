import express from "express";
const knowledgeBaseRouter = express.Router();
import KnowledgeBase from "../controllers/KnowledgeBase.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import fileUpload from "../middlewares/filUpload.middleware.js";

knowledgeBaseRouter.use(unifiedAuthProtect);

knowledgeBaseRouter.post("/", fileUpload.fields([{ name: "attachments" }, { name: "banner", maxCount: 1 }]), KnowledgeBase.create);
knowledgeBaseRouter.post("/import", KnowledgeBase.upload);
knowledgeBaseRouter.get("/", KnowledgeBase.read);
knowledgeBaseRouter.get("/unique/:key", KnowledgeBase.readByUniqueKey);
knowledgeBaseRouter.get("/:id", KnowledgeBase.readById);
knowledgeBaseRouter.patch("/:id", fileUpload.fields([{ name: "attachments" }, { name: "banner", maxCount: 1 }]), KnowledgeBase.update);
knowledgeBaseRouter.delete("/:id", KnowledgeBase.remove);

export default knowledgeBaseRouter;