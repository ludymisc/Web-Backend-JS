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
} from '../middleware/rateLimiter.js';

import AuthLoginToken from '../middleware/authLoginToken.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/change-password', AuthLoginToken, passwordChangeLimiter, changePassword);
router.post('/forgot-password', passwordChangeLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

export default router