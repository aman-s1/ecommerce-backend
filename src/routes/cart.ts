import express from 'express';
import authenticate from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate.authenticate, );

export default router;