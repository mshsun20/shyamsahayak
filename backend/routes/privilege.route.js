import expres from "express";
const privilegeRouter = expres.Router();
import Privilege from "../controllers/privilege.controller.js";

privilegeRouter.post("/", Privilege.create);
privilegeRouter.get("/", Privilege.read);
privilegeRouter.get("/:id", Privilege.readById);
privilegeRouter.get("/", Privilege.readByUniqueKey);
privilegeRouter.patch("/:id", Privilege.update);
privilegeRouter.delete("/:id", Privilege.remove);

export default privilegeRouter;