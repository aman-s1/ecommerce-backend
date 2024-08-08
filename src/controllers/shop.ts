import { Request, Response } from 'express';
import Item from '../models/Item';

// TO get user information
const getUserInfo = (req: Request, res: Response): Response => {
  if (req.user) {
    console.log(req.user);
    return res.status(200).json(req.user);
  } else {
    return res.status(404).json({ success: false, message: 'Not Found' });
  }
};

// Add product only done by admin
const addProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, description, price, image } = req.body;

    // Validate input data
    if (!title || !description || price === undefined || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const newItem = new Item({
      title,
      description,
      price,
      image,
    });

    const savedItem = await newItem.save();

    return res.status(201).json({ message: 'Product added successfully', item: savedItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default {
  getUserInfo,
  addProduct
};
