import { Document, model, Schema } from 'mongoose';

// Define an interface for the User document
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

// Define the schema for the User model
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
  }
});

const User = model<IUser>('User', UserSchema);

export default User;
