import express from "express";
const metricRouter = express.Router();
import Metric from "../controllers/metric.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

metricRouter.use(unifiedAuthProtect);

metricRouter.post("/", Metric.create);
metricRouter.get("/", Metric.read);
metricRouter.get("/unique/:key", Metric.readByUniqueKey);
metricRouter.get("/:id", Metric.readById);
metricRouter.patch("/:id", Metric.update);
metricRouter.delete("/:id", Metric.remove);

export default metricRouter;
