import { Router } from 'express';

import { 
    register,
    login, 
    changePassword,
    forgotPassword,
    resetPassword
} from '../controllers/auth.controller.js';

import {
    loginLimiter,
    passwordChangeLimiter
} from '../services/rateLimiter.js';

import AuthLoginToken from '../services/authLoginToken.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.patch('/change-password', AuthLoginToken, passwordChangeLimiter, changePassword);
router.post('/forgot-password', passwordChangeLimiter, forgotPassword);
router.patch('/reset-password', resetPassword);

export default router