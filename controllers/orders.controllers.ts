import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { Orders , Products } from '../models/index';
import { createOrder }  from '../services/index';
import { IOrders, IUsers, RequestWithUser } from '../types';
import AppError from '../utils/appError';

async function createUserOrder (req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const userId = user._id;
        const { productId, quantity, shippingAddress } = req.body;

        const schema = z.object({
            productId: z.string().min(1),
            quantity: z.number().min(1),
            shippingAddress: z.object({
                street: z.string().min(1),
                city: z.string().min(1),
                state: z.string().min(1),
                zip: z.string().min(1),
                country: z.string().min(1),
            })
        });

        schema.parse({ productId, quantity, shippingAddress });

        const product = await Products.findById(productId);
        if (!product) {
            throw new AppError(404, 'fail', 'Product not found');
        }
        if (product.stock < quantity) {
            throw new AppError(400, 'fail', 'Insufficient stock');
        }

        const totalAmount = product.price * quantity;

        const newOrder = await Orders.create({
            userId,
            productId,
            quantity,
            productPrice: product.price,
            totalAmount,
            shippingAddress
        });

        product.stock -= quantity;
        await product.save();

        const razorpayOrder = await createOrder(totalAmount, 'INR', newOrder._id as string);
        newOrder.razorpayOrderId = razorpayOrder.id;
        newOrder.save();
        
        res.status(201).json({ message: 'Order created successfully', newOrder });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function getOrder(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId;
      const user = req.user as IUsers;
      const userId = user._id;
  
      const schema = z.object({
        orderId: z.string().min(1)
      });
      schema.parse({ orderId });
  
      const order = await Orders.findById(orderId)
        .populate('userId', 'name email') 
        .populate('productId', 'name price images'); 
  
      if (!order) {
        return next(new AppError(404, 'fail', 'Order not found'));
      }
  
      if (order.userId.toString() !== userId && (req as any).user.role !== 'admin') {
        return next(new AppError(403, 'fail', 'You are not authorized to view this order'));
      }
  
      res.status(200).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, 'fail', fromZodError(error).toString()));
      }
      next(error);
    }
  }

  async function cancelOrder(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const orderId = req.params.orderId;
        const user = req.user as IUsers;
        const userId = user._id;

        const schema = z.object({
            orderId: z.string().min(1),
        });

        schema.parse({ orderId });

        const order = await Orders.findById(orderId);

        if (!order) {
            throw new AppError(404, 'fail', 'Order not found');
        }

        if (order.userId.toString() !== userId && (req as any).user.role !== 'admin') {
            throw new AppError(403, 'fail', 'You are not authorized to cancel this order');
        }

        if (!['pending', 'processing', 'delivered'].includes(order.status)) {
            throw new AppError(400, 'fail', 'Order cannot be canceled in its current state');
        }

        const product = await Products.findById(order.productId);
        if (product) {
            product.stock += order.quantity;
            await product.save();
        } else {
            console.warn('Product not found when reverting stock for canceled order:', orderId);
        }

        order.status = 'canceled';
        await order.save();

        res.status(200).json({ message: 'Order canceled successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
};

async function getAllOrders(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const userId = user._id;
        const isAdmin = user.role === 'admin';
        let query = {};
        if (!isAdmin) {
            query = { userId };
        }

        const orders = await Orders.find(query)
            .populate('userId', 'name email')
            .populate('productId', 'name price images');

        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

async function webhookHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const requestedBody = JSON.stringify(req.body);
        const signature = req.headers['x-razorpay-signature'] as string;

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;
        const expectedSignature = crypto.createHmac('sha256', secret).update(requestedBody).digest('hex');

        if (signature !== expectedSignature) {
            return res.status(403).json({ message: 'Invalid signature' });
        }

        const order = req.body.payload.order.entity;

        const orderDoc = await Orders.findOne({ razorpayOrderId: order.id });

        if (!orderDoc) {
            return next(new AppError(404, 'fail', 'Order not found'));
        }

        if (order.status === 'paid') {
            orderDoc.status = 'paid';
            await orderDoc.save();
        }

        res.status(200).json({ message: 'Webhook received successfully' });
    }
     catch (error) {
        next(error);
    }
}

export { createUserOrder, getOrder, cancelOrder, getAllOrders, webhookHandler };

