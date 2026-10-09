import express from "express";
const schemeRouter = express.Router();
import Scheme from "../controllers/scheme.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import fileUpload from "../middlewares/filUpload.middleware.js";

schemeRouter.use(unifiedAuthProtect);

schemeRouter.post("/", fileUpload.single("banner"), Scheme.create);
schemeRouter.post("/import", Scheme.upload);
schemeRouter.get("/", Scheme.read);
schemeRouter.get("/unique/:key", Scheme.readByUniqueKey);
schemeRouter.get("/:id", Scheme.readById);
schemeRouter.patch("/:id", fileUpload.single("banner"), Scheme.update);
schemeRouter.delete("/:id", Scheme.remove);

export default schemeRouter;