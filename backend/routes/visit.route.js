import express from "express";
const visitRouter = express.Router();
import Visit from "../controllers/visit.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

visitRouter.use(unifiedAuthProtect);

visitRouter.post("/", requirePermission("visit:create"), Visit.create);
visitRouter.get("/", requirePermission("visit:read"), Visit.read);
visitRouter.get("/unique/:key", requirePermission("visit:read"), Visit.readByUniqueKey);
visitRouter.get("/:id", requirePermission("visit:read"), Visit.readById);
visitRouter.patch("/:id", requirePermission("visit:update"), Visit.update);
visitRouter.delete("/:id", requirePermission("visit:delete"), Visit.remove);

export default visitRouter;
