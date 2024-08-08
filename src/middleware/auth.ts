import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface DecodedToken {
  userId: string;
}

const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log(token);

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token not provided' });
        }

        const secretKey = process.env.JWT_SECRET_KEY || 'default_secret';
        const decodedToken = jwt.verify(token, secretKey) as DecodedToken;

        try {
            const foundUser = await User.findById(decodedToken.userId);
            if (!foundUser) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }
            req.user = foundUser;
            next();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export default {
    authenticate
};
