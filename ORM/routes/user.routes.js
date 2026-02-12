import { Router } from 'express';

import {
    getMe,
    changeRole
} from '../controllers/user.controller.js';

import AuthLoginToken from '../services/authLoginToken.js';

import IsAdmin from '../services/isAdmin.js';

const router = Router()

router.get('/me', AuthLoginToken, getMe);
router.patch('/admin/users/:id/role', AuthLoginToken, IsAdmin, changeRole);

export default router