import expres from "express";
const roleRouter = expres.Router();
import Role from "../controllers/role.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

roleRouter.use(unifiedAuthProtect);

roleRouter.post("/", requirePermission("role:create"), Role.create);
roleRouter.get("/", requirePermission("role:read"), Role.read);
roleRouter.get("/unique/:key", requirePermission("role:read"), Role.readByUniqueKey);
roleRouter.get("/:id", requirePermission("role:read"), Role.readById);
roleRouter.patch("/:id", requirePermission("role:update"), Role.update);
roleRouter.delete("/:id", requirePermission("role:delete"), Role.remove);
roleRouter.put("/:id/permissions", requirePermission("role:update"), Role.assignPermissions);

export default roleRouter;