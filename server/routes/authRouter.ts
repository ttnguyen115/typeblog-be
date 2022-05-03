import express from 'express';
import authController from '../controller/authController';
import * as validationMethods from '../middleware/validation';

const { validRegister } = validationMethods;

const router = express.Router();

router.post('/register', validRegister, authController.register);

export default router;