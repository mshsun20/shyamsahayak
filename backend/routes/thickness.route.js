import express from "express";
const thicknessRouter = express.Router();
import Thickness from "../controllers/thickness.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

thicknessRouter.use(unifiedAuthProtect);

thicknessRouter.post("/", Thickness.create);
thicknessRouter.get("/", Thickness.read);
thicknessRouter.get("/unique/:key", Thickness.readByUniqueKey);
thicknessRouter.get("/:id", Thickness.readById);
thicknessRouter.patch("/:id", Thickness.update);
thicknessRouter.delete("/:id", Thickness.remove);

export default thicknessRouter;
