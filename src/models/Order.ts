import { Document, model, Schema, Types } from "mongoose";

interface IOrderItem {
    itemId: Types.ObjectId;
    quantity: number;
}

interface IOrder extends Document {
    userId: Types.ObjectId;
    address: string;
    totalAmount: number;
    orderItems: IOrderItem[];
}

const OrderSchema = new Schema<IOrder>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    orderItems: [{
        itemId: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
}, {
    timestamps: true
});

const Order = model<IOrder>('Order', OrderSchema);

export default Order;
