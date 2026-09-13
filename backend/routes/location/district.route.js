import expres from "express";
const districtRouter = expres.Router();
import District from "../../controllers/location/district.controller.js";

districtRouter.post("/", District.create);
districtRouter.get("/", District.read);
districtRouter.get("/:id", District.readById);
districtRouter.get("/:key", District.readByUniqueKey);
districtRouter.patch("/:id", District.update);
districtRouter.delete("/:id", District.remove);

export default districtRouter;