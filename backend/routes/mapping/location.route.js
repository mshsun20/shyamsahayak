import express from "express";
const locationRouter = express.Router();
import Location from "../../controllers/mapping/location.controller.js";
import { unifiedAuthProtect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

locationRouter.use(unifiedAuthProtect);

locationRouter.post("/", Location.create);
locationRouter.post("/import", Location.upload);
locationRouter.get("/", Location.read);
locationRouter.get("/unique/:key", Location.readByUniqueKey);
locationRouter.get("/:id", Location.readById);
locationRouter.patch("/:id", Location.update);
locationRouter.delete("/:id", Location.remove);

export default locationRouter;