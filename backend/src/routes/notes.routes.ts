import { Router } from 'express';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  generateSummary,
  toggleShare,
  getSharedNote,
  getInsights,
} from '../controllers/notes.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Public route
router.get('/shared/:shareId', getSharedNote);

// Protected routes
router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/generate-summary', generateSummary);
router.post('/:id/toggle-share', toggleShare);
router.get('/meta/insights', getInsights);

export default router;
