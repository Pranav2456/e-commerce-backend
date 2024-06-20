import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { Products } from '../models/index';
import { redisClient } from '../services/index';
import { RequestWithUser , IUsers } from '../types/index';
import AppError from '../utils/appError';

async function addToCart(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
       const { productId, quantity } = req.body;
       const user = req.user as IUsers;
        const userId = user._id;

        const schema = z.object({
            productId: z.string().min(1),
            quantity: z.number().min(1)
        });
        schema.parse({ productId, quantity });
        
        const product = await Products.findById(productId);
        if (!product) {
            throw new AppError(404, 'fail', 'Product not found');
        }

        const cartKey = `cart:${userId}`; // Key for Redis
        await redisClient.hset(cartKey, productId, quantity);

        const cartItems = await redisClient.hgetall(cartKey);

        const populatedCartItems = await Promise.all(
            Object.keys(cartItems).map(async (productId) => {
                const product = await Products.findById(productId);
                return {
                    productId,
                    quantity: parseInt(cartItems[productId], 10),
                    product: product ? product.toObject() : null, // Include product details
                };
            })
        );

        res.status(200).json({ message: 'Product added to cart', cart: populatedCartItems });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function removeFromCart(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const userId = user._id;
        const productId  = req.params.productId;
        const cartKey = `cart:${userId}`;
        
        await redisClient.hdel(cartKey, productId);

        const cartItems = await redisClient.hgetall(cartKey);

        const populatedCartItems = await Promise.all(
            Object.keys(cartItems).map(async (productId) => {
                const product = await Products.findById(productId);
                return {
                    productId,
                    quantity: parseInt(cartItems[productId], 10),
                    product: product ? product.toObject() : null, // Include product details
                };
            })
        );

        res.status(200).json({ message: 'Product removed from cart', cart: populatedCartItems });
    } catch (error) {
        next(error);
    }
}

async function getCart(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const userId = user._id;
        const cartKey = `cart:${userId}`;
        const cartItems = await redisClient.hgetall(cartKey);

        const populatedCartItems = await Promise.all(
            Object.keys(cartItems).map(async (productId) => {
                const product = await Products.findById(productId);
                return {
                    productId,
                    quantity: parseInt(cartItems[productId], 10),
                    product: product ? product.toObject() : null, // Include product details
                };
            })
        );

        res.status(200).json({ cart: populatedCartItems });
    } catch (error) {
        next(error);
    }
}

async function updateCartItemQuantity(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { productId, quantity } = req.body;
        const user = req.user as IUsers;
        const userId = user._id;


        const schema = z.object({
            productId: z.string().min(1),
            quantity: z.number().int().positive()
        });
        schema.parse(req.body);


        const product = await Products.findById(productId);
        if (!product) {
            return next(new AppError(404, 'fail', 'Product not found'));
        }

        const cartKey = `cart:${userId}`;

        
        await redisClient.hset(cartKey, productId, quantity);

        
        const cartItems = await redisClient.hgetall(cartKey);

        const populatedCartItems = await Promise.all(
            Object.keys(cartItems).map(async (productId) => {
                const product = await Products.findById(productId);
                return {
                    productId,
                    quantity: parseInt(cartItems[productId], 10),
                    product: product ? product.toObject() : null,
                };
            })
        );

        res.status(200).json({ message: 'Cart item quantity updated', cart: populatedCartItems });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function clearCart(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const userId = user._id;

        const cartKey = `cart:${userId}`;


        await redisClient.del(cartKey);

        res.status(200).json({ message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
}

export { addToCart, removeFromCart, getCart, updateCartItemQuantity, clearCart };
