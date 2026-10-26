import express from "express";
const productWeightAllocationRouter = express.Router();
import ProductWeightAllocation from "../controllers/productWeightAllocation.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

productWeightAllocationRouter.use(unifiedAuthProtect);

productWeightAllocationRouter.post("/", ProductWeightAllocation.create);
productWeightAllocationRouter.get("/", ProductWeightAllocation.read);
productWeightAllocationRouter.get("/unique/:key", ProductWeightAllocation.readByUniqueKey);
productWeightAllocationRouter.get("/:id", ProductWeightAllocation.readById);
productWeightAllocationRouter.patch("/:id", ProductWeightAllocation.update);
productWeightAllocationRouter.delete("/:id", ProductWeightAllocation.remove);

export default productWeightAllocationRouter;
