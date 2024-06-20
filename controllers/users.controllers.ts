import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { Users } from '../models';
import { IUsers , RequestWithUser } from '../types';
import  AppError  from '../utils/appError';
import { createToken } from '../utils/hashing';


async function registerUser(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { firstName, lastName, email, password } = req.body;

        const schema = z.object({
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(6)
        });

        schema.parse({ firstName, lastName, email, password });

        const existingUser = await Users.findOne({ email });

        if(existingUser) {
            throw new AppError(400, 'fail', 'User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({ firstName, lastName, email, passwordHash: hashedPassword });
        await newUser.save();

        const token = createToken({ user: newUser });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
};

async function loginUser(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(6)
        });

        schema.parse({ email, password });

        const user = await Users.findOne({ email }) as IUsers;

        if(!user) {
            throw new AppError(
                401,
                'fail',
                'Unauthorized: Invalid credentials',
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if(!passwordMatch) {
            throw new AppError(
                401,
                'fail',
                'Unauthorized: Invalid Password',
            );
        }

        const token = createToken({ user });

        res.status(200).json({ token });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
};

async function updateUser(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const { firstName, lastName, email } = req.body;
        const user = req.user as IUsers;

        const schema = z.object({
            firstName: z.string().min(1),
            lastName: z.string().min(1),
            email: z.string().email(),
        });

        schema.parse({ firstName, lastName, email });

        const updatedUser = await Users.findByIdAndUpdate(user._id, { firstName, lastName, email }, { new: true });

        if(!updatedUser) {
            throw new AppError(400, 'fail', 'User not found');
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function changePassword(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const { currentPassword, newPassword } = req.body;

        const schema = z.object({
            currentPassword: z.string().min(6),
            newPassword: z.string().min(6)
        });

        schema.parse({ currentPassword, newPassword });

        const existingUser = await Users.findById(user._id) as IUsers;
        if (!existingUser) {
            throw new AppError(400, 'fail', 'User not found');
        }

        const passwordMatch = await bcrypt.compare(currentPassword, existingUser.passwordHash);

        if (!passwordMatch) {
            throw new AppError(400, 'fail', 'Incorrect password');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Users.findByIdAndUpdate(user._id, { passwordHash: hashedPassword });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function addAddress(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const { street, city, state, zip, country } = req.body;

        const schema = z.object({
            street: z.string().min(1),
            city: z.string().min(1),
            state: z.string().min(1),
            zip: z.string().min(1),
            country: z.string().min(1)
        });

        schema.parse({ street, city, state, zip, country });

        const addressId = randomUUID() as string;

        const updatedUser = await Users.findByIdAndUpdate(user._id, { $push: { addresses: { addressId, street, city, state, zip, country } } }, { new: true });

        if(!updatedUser) {
            throw new AppError(400, 'fail', 'User not found');
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        next(error);
    }
}

async function updateAddress(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const { addressId, street, city, state, zip, country } = req.body;

        const schema = z.object({
            addressId: z.string().min(1),
            street: z.string().min(1),
            city: z.string().min(1),
            state: z.string().min(1),
            zip: z.string().min(1),
            country: z.string().min(1)
        });

        schema.parse({ addressId, street, city, state, zip, country });

        const updatedUser = await Users.findOneAndUpdate(
            { _id: user._id, 'addresses.addressId': addressId },
            { $set: { 'addresses.$': { addressId, street, city, state, zip, country } } },
            { new: true }
        );

        if(!updatedUser) {
            throw new AppError(400, 'fail', 'Address not found');
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

async function deleteAddress(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const user = req.user as IUsers;
        const { addressId } = req.body;

        const schema = z.object({
            addressId: z.string().min(1),
        });

        schema.parse({ addressId });

        const updatedUser = await Users.findByIdAndUpdate(user._id, { $pull: { addresses: { addressId } } }, { new: true });

        if(!updatedUser) {
            throw new AppError(400, 'fail', 'Address not found');
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, 'fail', fromZodError(error).toString()));
        }
        next(error);
    }
}

export { registerUser, loginUser, updateUser, changePassword, addAddress, updateAddress, deleteAddress };
