import { Schema, model } from 'mongoose';
import { IOrders } from '../types';

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },

    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },

    productPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },

    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },

    razorpayOrderId: {
        type: String,
    },

    status: {
        type: String,
        enum: ['pending', 'processing','paid', 'shipped', 'delivered', 'canceled'],
        default: 'pending',
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Orders = model<IOrders>('Orders', orderSchema);
export default Orders;
