import express from 'express';
import shop from '../controllers/shop';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/', auth.authenticate, shop.getUserInfo);

router.post('/add-product', auth.authenticate, shop.addProduct);

router.get('/products', auth.authenticate, shop.getProducts);

router.delete('/products/:id', auth.authenticate, shop.deleteProduct);

export default router;
