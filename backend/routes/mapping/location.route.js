import express from "express";
const locationRouter = express.Router();
import Location from "../../controllers/mapping/location.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

locationRouter.use(unifiedAuthProtect);

locationRouter.post("/", requirePermission("location:create"), Location.create);
locationRouter.post("/import", requirePermission("location:create"), Location.upload);
locationRouter.get("/", requirePermission("location:read"), Location.read);
locationRouter.get("/unique/:key", requirePermission("location:read"), Location.readByUniqueKey);
locationRouter.get("/:id", requirePermission("location:read"), Location.readById);
locationRouter.patch("/:id", requirePermission("location:update"), Location.update);
locationRouter.delete("/:id", requirePermission("location:delete"), Location.remove);

export default locationRouter;