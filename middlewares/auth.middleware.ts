import { Response, NextFunction } from 'express';
import { Users } from '../models';
import { RequestWithUser } from '../types';
import AppError from '../utils/appError';
import { verifyToken } from '../utils/hashing';

async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token) {
            throw new AppError(
                401,
                'fail',
                'You are not logged in! Please log in to get access.',
            );
        }

        const decoded = verifyToken(token);

        if(!decoded.user) {
            throw new AppError(
                401,
                'fail',
                'Invalid token. Please log in to get access.',
            );
        }

        const user = await Users.findOne({ email: decoded.user.email });
        if(!user) {
            throw new AppError(
                401,
                'fail',
                'Unauthorized Access: Invalid credentials',
            );
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

function checkRole(roles: string[]) {
    return function (req: RequestWithUser, res: Response, next: NextFunction) {
        if (!req.user) {
            throw new AppError(
                401,
                'fail',
                'Unauthorized: Authentication required',
            );
        }

        if (!roles.includes(req.user.role)) {
            throw new AppError(
                403,
                'fail',
                'Forbidden: Insufficient permissions',
            );
        }
        next();
    };
}

export { authMiddleware, checkRole };
