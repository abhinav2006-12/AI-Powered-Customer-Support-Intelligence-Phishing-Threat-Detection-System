import { Router } from 'express';
import { handleChatMessage, handleGetChatSuggestions } from '../controllers/chat.controller.js';

const router = Router();

router.post('/', handleChatMessage);
router.get('/suggestions', handleGetChatSuggestions);

export default router;
