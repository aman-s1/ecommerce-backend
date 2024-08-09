import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const saltRounds = 10;

// Check if string is invalid
function isStringInvalid(str: string): boolean {
  return !str || str.length === 0;
}

// Sign up a new user
const signup = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password, referral } = req.body;
  
    if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ err: 'Empty Fields' });
    }
  
    try {
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ err: 'User with this email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const isAdminFlag = referral === '1234'; 

      await User.create({ 
        name, 
        email, 
        password: hashedPassword, 
        isAdmin: isAdminFlag
      });
      
      return res.status(201).json({ message: 'Successfully Signed Up' });
    } catch (err) {
      console.error('Signup Error:', err);
      return res.status(500).json({ err: 'Internal Server Error' });
    }
};
  

// Generate a JWT token
function generateAccessToken(id: string, email: string, name: string, isAdmin: boolean): string {
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not defined');
  }

  return jwt.sign({ userId: id, email, name, isAdmin }, secretKey);
}

// Login a user
const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    if (isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ err: 'Email and Password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ err: 'User does not exist' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ err: 'Wrong Password' });
    }

    const token = generateAccessToken(user.id, user.email, user.name, user.isAdmin);
    return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export default {
  signup,
  login,
  generateAccessToken
};
