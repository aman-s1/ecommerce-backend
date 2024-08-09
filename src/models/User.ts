import { Document, model, Schema, Types } from 'mongoose';

interface ICartItem {
  itemId: Types.ObjectId;
  title: string;
  quantity: number;
  price: number;
}

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  cartItems: ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cartItems: {
    type: [CartItemSchema],
    default: [],
  },
});

const User = model<IUser>('User', UserSchema);

export default User;
