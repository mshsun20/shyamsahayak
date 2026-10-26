import express from "express";
const metricRouter = express.Router();
import Metric from "../controllers/metric.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

metricRouter.use(unifiedAuthProtect);

metricRouter.post("/", requirePermission("metric:create"), Metric.create);
metricRouter.get("/", requirePermission("metric:read"), Metric.read);
metricRouter.get("/unique/:key", requirePermission("metric:read"), Metric.readByUniqueKey);
metricRouter.get("/:id", requirePermission("metric:read"), Metric.readById);
metricRouter.patch("/:id", requirePermission("metric:update"), Metric.update);
metricRouter.delete("/:id", requirePermission("metric:delete"), Metric.remove);

export default metricRouter;
