import mongoose, { Document, SchemaTimestampsConfig } from 'mongoose';

export interface IUsers extends Document, SchemaTimestampsConfig {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: string;
    addresses: string[];
}

export interface IProducts extends Document, SchemaTimestampsConfig {
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
}

export interface IOrders extends Document, SchemaTimestampsConfig {
    userId: mongoose.Schema.Types.ObjectId;
    productId: string;
    quantity: number;
    productPrice: number;
    totalAmount: number;
    shippingAddress: string;
    razorpayOrderId: string;
    status: string;
}
