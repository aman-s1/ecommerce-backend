import express from 'express';
import auth from '../middleware/auth';
import cart from '../controllers/cart';

const router = express.Router();

router.post('/add-item', auth.authenticate, cart.addItem);

router.post('/delete-item', auth.authenticate, cart.decreaseItem);

router.get('/get-items', auth.authenticate, cart.getCartItems);

router.post('/checkout', auth.authenticate, cart.createOrder);

export default router;