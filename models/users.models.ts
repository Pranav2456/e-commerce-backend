import { Schema, model } from 'mongoose';
import { IUsers } from '../types';

const usersSchmema = new Schema({
    firstName:{
        type: String,
        required: true,
    },

    lastName:{
        type: String,
        required: true,
    },

    email:{
        type: String,
        required: true,
        unique: true,
    },

    passwordHash:{
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
    },

    addresses: [{
        addressId: { type: String, required: true, unique: true },
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Users = model<IUsers>('Users', usersSchmema);
export default Users;
