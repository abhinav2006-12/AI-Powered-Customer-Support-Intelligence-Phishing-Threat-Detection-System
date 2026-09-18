import express from 'express';
import { getThreats, getThreatById } from '../controllers/threats.controller.js';

const router = express.Router();

router.get('/', getThreats);
router.get('/:id', getThreatById);

export default router;
