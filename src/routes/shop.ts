import express from 'express';
import shopController from '../controllers/shop';
import authenticate from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate.authenticate, shopController.getUserInfo);

router.post('/add-product', authenticate.authenticate, shopController.addProduct);

export default router;
