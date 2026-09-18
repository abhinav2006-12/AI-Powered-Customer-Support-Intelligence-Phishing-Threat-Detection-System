import express from 'express';
import { analyzeNewConversation, reanalyzeConversation } from '../controllers/analysis.controller.js';

const router = express.Router();

router.post('/', analyzeNewConversation);
router.post('/conversations/:id/analyze', reanalyzeConversation);

export default router;
