import { Document, model, Schema } from 'mongoose';

interface IItem extends Document {
  title: string;
  description: string;
  price: number;
  image: string;
}

const ItemSchema = new Schema<IItem>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
});

const Item = model<IItem>('Item', ItemSchema);

export default Item;
