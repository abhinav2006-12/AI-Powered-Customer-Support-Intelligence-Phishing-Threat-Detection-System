import express from 'express';
import { getConversations, getConversationById, createConversation, deleteConversation } from '../controllers/conversations.controller.js';

const router = express.Router();

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.post('/', createConversation);
router.delete('/:id', deleteConversation);

export default router;
