import { Router } from 'express';
import { engineController } from '../controllers/engineController.js';

const router = Router();

router.get('/strategy', (req, res) => engineController.getEngineStatus(req, res));
router.post('/strategy', (req, res) => engineController.setStrategy(req, res));

export default router;
