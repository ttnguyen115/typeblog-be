import express from 'express';
import authController from '../controller/authController';
import * as validationMethods from '../middleware/validation';

const { validRegister } = validationMethods;

const router = express.Router();

router.post('/register', validRegister, authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/active', authController.activeAccount);
router.get('/refresh_token', authController.refreshToken);

export default router;