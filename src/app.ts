import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import userRoutes from './routes/user';
import shopRoutes from './routes/shop';
import cartRoutes from './routes/cart';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure CORS middleware is applied before routes
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// app.options('*', cors({
//     origin: 'https://ecomm-application-frontend.netlify.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }));

app.use(express.json());

// Your routes
app.use('/', userRoutes);
app.use('/shop', shopRoutes);
app.use('/cart', cartRoutes);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Connected to MongoDB!');
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

export default app;
