import { Router } from 'express';
import sessionController from '../controllers/sessionController.ts';

const sessionRouter = Router();

sessionRouter.get('/', sessionController.getAllSessions);
sessionRouter.post('/', sessionController.createNewSession)

export default sessionRouter;
