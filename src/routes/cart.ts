import express from 'express';
import authenticate from '../middleware/auth';
import cart from '../controllers/cart';

const router = express.Router();

router.post('/add-item', authenticate.authenticate, cart.addItem);

router.post('/delete-item', authenticate.authenticate, cart.decreaseItem);

router.get('/get-items', authenticate.authenticate, cart.getCartItems);

export default router;