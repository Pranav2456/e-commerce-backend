import { Schema, model } from 'mongoose';
import { IProducts } from '../types';

const productsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    images: [{
        type: String
    }],

    stock : {
        type: Number,
        required: true,
        min: 0,
    },

    category: {
        type: String,
        required: true,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Products = model<IProducts>('Products', productsSchema);
export default Products;
