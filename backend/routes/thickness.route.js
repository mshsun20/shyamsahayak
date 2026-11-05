import express from "express";
const thicknessRouter = express.Router();
import Thickness from "../controllers/thickness.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

thicknessRouter.use(unifiedAuthProtect);

thicknessRouter.post("/", requirePermission("thickness:create"), Thickness.create);
thicknessRouter.get("/", requirePermission("thickness:read"), Thickness.read);
thicknessRouter.get("/unique/:key", requirePermission("thickness:read"), Thickness.readByUniqueKey);
thicknessRouter.get("/:id", requirePermission("thickness:read"), Thickness.readById);
thicknessRouter.patch("/:id", requirePermission("thickness:update"), Thickness.update);
thicknessRouter.delete("/:id", requirePermission("thickness:delete"), Thickness.remove);

export default thicknessRouter;
