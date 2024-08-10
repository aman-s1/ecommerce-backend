import express from 'express';
import user from '../controllers/user';

const router = express.Router();

router.post('/signup', user.signup);

router.post('/login', user.login);

export default router;