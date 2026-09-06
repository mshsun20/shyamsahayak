import expres from "express";
const roleRouter = expres.Router();
import Role from "../controllers/role.controller.js";

roleRouter.post("/", Role.create);
roleRouter.get("/", Role.read);
roleRouter.get("/:id", Role.readById);
roleRouter.get("/", Role.readByUniqueKey);
roleRouter.patch("/:id", Role.update);
roleRouter.delete("/:id", Role.remove);

export default roleRouter;