import { Router } from 'express';
import chatController from '../controllers/chatController.ts';

const chatRouter = Router();

chatRouter.post('/', chatController.sendMessage);
chatRouter.post('/clear', chatController.clearSession);
chatRouter.post('/history', chatController.getSessionHistory)

export default chatRouter;
