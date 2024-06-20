import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import AppError from '../utils/appError';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

async function createOrder(amount: number, currency: string = 'INR', receipt: string): Promise<any> {
    try {
        const options = {
            amount: amount * 100, 
            currency,
            receipt,
        };
        const order = await new Promise((resolve, reject) => {
            razorpay.orders.create(options, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });

        return order;
        }
         catch (error) {
        throw new AppError(500, 'fail', 'Error while creating order');
    }
}

export { createOrder };
