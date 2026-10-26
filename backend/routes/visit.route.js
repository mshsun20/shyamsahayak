import express from "express";
const visitRouter = express.Router();
import Visit from "../controllers/visit.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

visitRouter.use(unifiedAuthProtect);

visitRouter.post("/", Visit.create);
visitRouter.get("/", Visit.read);
visitRouter.get("/unique/:key", Visit.readByUniqueKey);
visitRouter.get("/:id", Visit.readById);
visitRouter.patch("/:id", Visit.update);
visitRouter.delete("/:id", Visit.remove);

export default visitRouter;
