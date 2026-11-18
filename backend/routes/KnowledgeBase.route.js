import express from "express";
const knowledgeBaseRouter = express.Router();
import KnowledgeBase from "../controllers/KnowledgeBase.controller.js";
import KnowledgeBaseCategory from "../controllers/KnowledgeBaseCategory.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import fileUpload from "../middlewares/filUpload.middleware.js";

knowledgeBaseRouter.use(unifiedAuthProtect);

// knowledgeBaseRouter.post("/", fileUpload.fields([{ name: "attachments" }, { name: "banner", maxCount: 1 }]), KnowledgeBase.create);
// knowledgeBaseRouter.post("/import", KnowledgeBase.upload);
// knowledgeBaseRouter.get("/", KnowledgeBase.read);
// knowledgeBaseRouter.get("/unique/:key", KnowledgeBase.readByUniqueKey);
// knowledgeBaseRouter.get("/:id", KnowledgeBase.readById);
// knowledgeBaseRouter.patch("/:id", fileUpload.fields([{ name: "attachments" }, { name: "banner", maxCount: 1 }]), KnowledgeBase.update);
// knowledgeBaseRouter.delete("/:id", KnowledgeBase.remove);


// Category routes must precede /:id routes.
knowledgeBaseRouter.get("/categories", KnowledgeBaseCategory.list);
knowledgeBaseRouter.post("/categories", KnowledgeBaseCategory.create);
knowledgeBaseRouter.patch("/categories/:id", KnowledgeBaseCategory.update);
knowledgeBaseRouter.delete("/categories/:id", KnowledgeBaseCategory.remove);

knowledgeBaseRouter.post("/reindex-all", KnowledgeBase.reindexAll);
knowledgeBaseRouter.post("/", fileUpload.fields([{ name: "attachments" }, { name: "banner", maxCount: 1 }]), KnowledgeBase.create);
knowledgeBaseRouter.post("/import", KnowledgeBase.upload);
knowledgeBaseRouter.get("/", KnowledgeBase.read);
knowledgeBaseRouter.get("/unique/:key", KnowledgeBase.readByUniqueKey);
knowledgeBaseRouter.post("/:id/reindex", KnowledgeBase.reindex);
knowledgeBaseRouter.get("/:id", KnowledgeBase.readById);
knowledgeBaseRouter.patch("/:id", fileUpload.fields([{ name: "attachments" }, { name: "banner", maxCount: 1 }]), KnowledgeBase.update);
knowledgeBaseRouter.delete("/:id", KnowledgeBase.remove);

export default knowledgeBaseRouter;