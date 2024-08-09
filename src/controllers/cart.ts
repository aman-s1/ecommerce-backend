import { Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';
import Item from '../models/Item';

const addItem = async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    const { itemId, quantity }: { itemId: string; quantity: number } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItemIndex = user.cartItems.findIndex(item => item.itemId.toString() === itemId);

        if (cartItemIndex >= 0) {
            user.cartItems[cartItemIndex].quantity += quantity;
        } else {
            user.cartItems.push({
                itemId: new mongoose.Types.ObjectId(itemId),
                quantity,
            });
        }

        await user.save();
        res.status(200).json({ message: 'Item added to cart', cartItems: user.cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to cart', error: (error as Error).message });
    }
};

const decreaseItem = async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    const { itemId, quantity }: { itemId: string; quantity: number } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItemIndex = user.cartItems.findIndex(item => item.itemId.toString() === itemId);

        if (cartItemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        user.cartItems[cartItemIndex].quantity -= quantity;

        if (user.cartItems[cartItemIndex].quantity <= 0) {
            user.cartItems.splice(cartItemIndex, 1);
        }

        await user.save();
        res.status(200).json({ message: 'Cart updated', cartItems: user.cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update cart', error: (error as Error).message });
    }
};

const getCartItems = async (req: Request, res: Response) => {
    const userId = req.user?._id as string;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Populate item details manually
        const cartItems = await Promise.all(
            user.cartItems.map(async cartItem => {
                const item = await Item.findById(cartItem.itemId).exec();
                if (!item) {
                    throw new Error(`Item with ID ${cartItem.itemId} not found`);
                }

                return {
                    _id: cartItem.itemId.toString(),
                    title: item.title,
                    price: item.price,
                    quantity: cartItem.quantity,
                };
            })
        );

        res.status(200).json({ cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch cart items', error: (error as Error).message });
    }
};

export default {
    addItem,
    decreaseItem,
    getCartItems,
};
