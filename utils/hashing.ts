import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import  AppError  from './appError';

function createToken(payload: any): string {
    try {
        const token = sign(payload, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES_IN });
        return token;
    } catch (error) {
        throw new AppError(500, 'fail', 'Error while creating token',);
    }
}

function verifyToken(token: string): any {
    try {
        const decoded = verify(token, process.env.JWT_SECRET as string);
        return decoded;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError(401, 'fail', 'Session expired! Please login again');
        }
        throw new AppError(500, 'fail', 'Error while verifying token');
    }
}

export { createToken, verifyToken };
