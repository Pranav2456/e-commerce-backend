import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { Products } from '../models';
import AppError from '../utils/appError';

async function getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
        const products = await Products.find({});
        if (!products) {
            throw new AppError(404, 'fail', 'No products found');
        }
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

async function getProduct (req: Request, res: Response, next: NextFunction) {
    try {
        const product = await Products.findById(req.params.productId);
        if (!product) {
            throw new AppError(404, 'fail', 'Product not found');
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
}

async function createProduct (req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description, price, images, stock, category } = req.body;

        const schema = z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            price: z.number().min(0),
            images: z.array(z.string()),
            stock: z.number().min(0),
            category: z.string()
        });

        schema.parse({ name, description, price, images, stock, category });

        const newProduct = new Products({ name, description, price, images, stock, category });
        await newProduct.save();

        res.status(201).json({ message: 'Product created successfully', newProduct });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function updateProduct (req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description, price, images, stock, category } = req.body;

        const schema = z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            price: z.number().min(0),
            images: z.array(z.string()),
            stock: z.number().min(0),
            category: z.string()
        });

        schema.parse({ name, description, price, images, stock, category });

        const product = await Products.findByIdAndUpdate(req.params.productId, { name, description, price, images, stock, category }, { new: true });
        if (!product) {
            throw new AppError(404, 'fail', 'Product not found');
        }

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function deleteProduct (req: Request, res: Response, next: NextFunction) {
    try {
        const product = await Products.findByIdAndDelete(req.params.productId);
        if (!product) {
            throw new AppError(404, 'fail', 'Product not found');
        }

        res.status(204).json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct };

