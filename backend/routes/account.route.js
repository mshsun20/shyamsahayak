import expres from "express";
const accountRouter = expres.Router();
import Account from "../controllers/account.controller.js";

accountRouter.post("/", Account.create);
accountRouter.post("/", Account.read);

export default accountRouter;