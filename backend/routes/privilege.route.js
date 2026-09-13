import expres from "express";
const privilegeRouter = expres.Router();
import Privilege from "../controllers/privilege.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

privilegeRouter.use(unifiedAuthProtect);

privilegeRouter.post("/", requirePermission("privilege:create"), Privilege.create);
privilegeRouter.get("/", requirePermission("privilege:read"), Privilege.read);
privilegeRouter.get("/unique/:key", requirePermission("privilege:read"), Privilege.readByUniqueKey);
privilegeRouter.get("/:id", requirePermission("privilege:read"), Privilege.readById);
privilegeRouter.patch("/:id", requirePermission("privilege:update"), Privilege.update);
privilegeRouter.delete("/:id", requirePermission("privilege:delete"), Privilege.remove);
privilegeRouter.put("/:id/permissions", requirePermission("privilege:update"), Privilege.assignPermissions);

export default privilegeRouter;