import { Router } from 'express';
import { healthCheck, notFound, errorHandler } from '../controllers/helpers.controllers';
import { authMiddleware } from '../middlewares/index';
import cartRouter from './cart.routes';
import ordersRouter from './orders.routes';
import productsRouter from './product.routes';
import usersRouter from './user.routes';

const router = Router();

router.get('/', healthCheck);

router.use('/users', usersRouter);
router.use('/products', authMiddleware, productsRouter);
router.use('/orders', authMiddleware, ordersRouter);
router.use('/cart', authMiddleware, cartRouter);

router.all('*', notFound);

router.use(errorHandler);

export default router;

