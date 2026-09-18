import express from "express";
const accountRouter = express.Router();
import Account from "../controllers/account.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

accountRouter.use(unifiedAuthProtect);

accountRouter.post("/", requirePermission("account:create"), Account.create);
accountRouter.post("/import", requirePermission("account:create"), Account.upload);
accountRouter.get("/", requirePermission("account:read"), Account.read);
accountRouter.get("/unique/:key", requirePermission("account:read"), Account.readByUniqueKey);
accountRouter.get("/:id", requirePermission("account:read"), Account.readById);
accountRouter.patch("/:id", requirePermission("account:update"), Account.update);
accountRouter.delete("/:id", requirePermission("account:delete"), Account.remove);

export default accountRouter;