import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Order from '../models/Order';
import Item from '../models/Item';

const Sib: any = require('sib-api-v3-sdk');
dotenv.config();

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

const checkCoupon = async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    try {
        const { coupon } = req.body;

        if (!coupon || typeof coupon !== 'string') {
            return res.status(400).json({ message: 'Coupon code is required and must be a string' });
        }

        // Validate coupon
        if (coupon.trim() == "DIWALIDHAMAKA" || coupon.trim() == "CHRISTMASCHARITY") {
            const user = await User.findById(userId).populate('cartItems.itemId');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            let totalAmount = 0;
            for (const cartItem of user.cartItems) {
                const item = cartItem.itemId as any;
                if (item && item.price) {
                    totalAmount += item.price * cartItem.quantity;
                }
            }
            const discountPercentage = 20;
            const discountAmount = (totalAmount * discountPercentage) / 100;
            const newTotalAmount = totalAmount - discountAmount;

            await User.findByIdAndUpdate(userId, {
                $set: {
                    "cartItems": user.cartItems,
                }
            });

            return res.status(200).json({
                message: 'Coupon applied successfully!',
                isValid: true,
                discountAmount: discountAmount,
                newTotalAmount: newTotalAmount,
            });
        } else {
            return res.status(400).json({ message: 'Invalid coupon code', isValid: false });
        }
    } catch (error) {
        console.error('Error checking coupon:', error);
        res.status(500).json({ message: 'An error occurred while checking the coupon', error });
    }
};

const createOrder = async (req: Request, res: Response) => {
    const userId = req.user?._id as string;
    const { address, totalAmount, orderItems }: { address: string; totalAmount: number; orderItems: { itemId: string; quantity: number }[] ;} = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!address || totalAmount <= 0 || !Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const order = new Order({
            userId,
            address,
            totalAmount,
            orderItems
        });

        await order.save();

        const user = await User.findById(userId);
        if (user) {
            user.cartItems = [];
            await user.save();
        }

        // Prepare order details for the email
        const cartItemsDetails = orderItems.map(async ({ itemId, quantity }) => {
            const item = await Item.findById(itemId).exec();
            return {
                title: item?.title || 'Unknown Item',
                price: item?.price || 0,
                quantity
            };
        });

        const itemsDetails = await Promise.all(cartItemsDetails);
        const itemsHtml = itemsDetails.map(item => 
            `<li>${item.title}: ${item.quantity} x $${item.price.toFixed(2)}</li>`
        ).join('');

        // Set up Sendinblue client
        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.SB_API_KEY;

        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const sender = {
            email: process.env.EMAIL_USER,
            name: `Shopper's Point`,
        };

        const receivers = [
            {
                email: req.user?.email,
            },
        ];

        // Send the email
        tranEmailApi
            .sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Order Confirmation',
                htmlContent: `
                    <h3>Order Confirmation</h3>
                    <p>Dear ${req.user?.name},</p>
                    <p>Thank you for your purchase! Here are the details of your order:</p>
                    <p><strong>Shipping Address:</strong> ${address}</p>
                    <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                    <ul>${itemsHtml}</ul>
                    <p>We hope you enjoy your purchase!</p>
                    <p>Best regards,</p>
                    <p>Shopper's Point</p>
                `,
                params: {
                    role: 'Customer',
                },
            })
            .then(() => {
                console.log('Order confirmation email sent successfully');
                res.status(201).json({ message: 'Order created successfully', order });
            })
            .catch((error: any) => {
                console.error('Failed to send order confirmation email:', error);
                res.status(500).json({ message: 'Order created, but failed to send confirmation email', error });
            });

    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ message: 'Failed to create order', error: (error as Error).message });
    }
};

export default {
    addItem,
    decreaseItem,
    getCartItems,
    createOrder,
    checkCoupon
};
