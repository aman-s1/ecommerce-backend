import express from 'express';
import shopController from '../controllers/shop';
import authenticate from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate.authenticate, shopController.getUserInfo);

router.post('/add-product', authenticate.authenticate, shopController.addProduct);

router.get('/products', authenticate.authenticate, shopController.getProducts);

router.delete('/products/:id', authenticate.authenticate, shopController.deleteProduct);

export default router;
