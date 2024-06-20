import Redis from 'ioredis';
import AppError from '../utils/appError';

const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
});

redisClient.on('error', (error) => {
    throw new AppError(500, 'fail', 'Error while connecting to Redis');
});

export { redisClient };
