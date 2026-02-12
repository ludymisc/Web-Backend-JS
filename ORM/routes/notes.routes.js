import { Router } from 'express';

import {
    getNote,
    addNote,
    getGallery,
    updateNote,
    deleteNote
} from '../controllers/notes.controller.js';

const router = Router();

router.post('/notes', addNote);
router.get('/gallery/:user_id', getGallery);
router.get('/gallery/:note_id', getNote);
router.put('/note/:note_id', updateNote);
router.delete('/note/:note_id', deleteNote);

export default router