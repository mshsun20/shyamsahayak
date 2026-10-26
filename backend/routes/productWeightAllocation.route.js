import express from "express";
const productWeightAllocationRouter = express.Router();
import ProductWeightAllocation from "../controllers/productWeightAllocation.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

productWeightAllocationRouter.use(unifiedAuthProtect);

productWeightAllocationRouter.post("/", requirePermission("product-weight-allocation:create"), ProductWeightAllocation.create);
productWeightAllocationRouter.get("/", requirePermission("product-weight-allocation:read"), ProductWeightAllocation.read);
productWeightAllocationRouter.get("/unique/:key", requirePermission("product-weight-allocation:read"), ProductWeightAllocation.readByUniqueKey);
productWeightAllocationRouter.get("/:id", requirePermission("product-weight-allocation:read"), ProductWeightAllocation.readById);
productWeightAllocationRouter.patch("/:id", requirePermission("product-weight-allocation:update"), ProductWeightAllocation.update);
productWeightAllocationRouter.delete("/:id", requirePermission("product-weight-allocation:delete"), ProductWeightAllocation.remove);

export default productWeightAllocationRouter;
