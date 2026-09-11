import expres from "express";
const accountRouter = expres.Router();
import Account from "../controllers/account.controller.js";
import { jwtHybrdProtect, basicAuth } from "../middlewares/auth.middleware.js";

// accountRouter.use(jwtHybrdProtect);

accountRouter.post("/", Account.create);
accountRouter.get("/", Account.read);
accountRouter.get("/:id", Account.readById);
accountRouter.get("/", Account.readByUniqueKey);
accountRouter.patch("/:id", Account.update);
accountRouter.delete("/:id", Account.remove);

export default accountRouter;