import express from "express";
const productRouter = express.Router();
import Product from "../controllers/product.controller.js";
import { unifiedAuthProtect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import fileUpload from "../middlewares/filUpload.middleware.js";

productRouter.use(unifiedAuthProtect);

productRouter.post("/", fileUpload.single("image"), Product.create);
productRouter.post("/import", Product.upload);
productRouter.get("/", Product.read);
productRouter.get("/unique/:key", Product.readByUniqueKey);
productRouter.get("/:id", Product.readById);
productRouter.patch("/:id", fileUpload.single("image"), Product.update);
productRouter.delete("/:id", Product.remove);

export default productRouter;