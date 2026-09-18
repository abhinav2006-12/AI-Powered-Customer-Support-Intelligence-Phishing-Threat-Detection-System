import express from 'express';
import { getDatasetInfo, importDataset, clearDataset, seedDemoData } from '../controllers/dataset.controller.js';

const router = express.Router();

router.get('/', getDatasetInfo);
router.post('/import', importDataset);
router.delete('/', clearDataset);
router.post('/seed', seedDemoData);

export default router;
