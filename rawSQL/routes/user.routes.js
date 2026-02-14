import { Router } from 'express';

import {
    getMe,
    changeRole
} from '../controllers/user.controller.js';

import AuthLoginToken from '../middleware/authLoginToken.js';

import IsAdmin from '../middleware/isAdmin.js';

const router = Router()

router.get('/me', AuthLoginToken, getMe);
router.patch('/admin/users/:id/role', AuthLoginToken, IsAdmin, changeRole);

export default router