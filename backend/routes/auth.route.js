import express from 'express';
const authRouter = express.Router();
import Auth from '../controllers/auth.controller.js';

authRouter.post('/login', Auth.login);
authRouter.get('/session', Auth.checkAuth);
authRouter.post('/regenerate-token', Auth.regenerateAccessToken);
authRouter.post('/logout', Auth.logout);

export default authRouter;