import { Router } from 'express';
import { getApiRoot, getHealth } from '../controllers/systemController.js';

const router = Router();

router.get('/health', getHealth);
router.get('/api', getApiRoot);

export default router;
