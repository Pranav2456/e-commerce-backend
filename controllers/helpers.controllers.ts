import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';

function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction) {
    if (err) {
        let status = 200;
        if (err instanceof AppError) status = err.statusCode;
        else status = res.statusCode == 200 ? 500 : res.statusCode;
        const message = err?.message || 'Something went wrong';
        res.status(status).json(message);
    }
    else next();
}

function healthCheck(req: Request, res: Response) {
    res.status(200).send('OK');
}

function notFound(req: Request, res: Response) {
    res.status(404).send('Not Found');
}

export { errorHandler, healthCheck, notFound };
