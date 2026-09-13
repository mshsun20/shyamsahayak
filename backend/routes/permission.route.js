import express from "express";
const permissionRouter = express.Router();
import Permission from "../controllers/permission.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";


permissionRouter.use(unifiedAuthProtect);

permissionRouter.post("/", requirePermission("permission:create"), Permission.create);
permissionRouter.get("/", requirePermission("permission:read"), Permission.read);
permissionRouter.get("/:id", requirePermission("permission:read"), Permission.readById);
permissionRouter.patch("/:id", requirePermission("permission:update"), Permission.update);
permissionRouter.delete("/:id", requirePermission("permission:delete"), Permission.remove);

export default permissionRouter;