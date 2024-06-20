import { Router } from 'express';
import { getAllOrders, getOrder, createUserOrder, cancelOrder, webhookHandler } from '../controllers/index';
import { checkRole } from '../middlewares/index';

const ordersRouter = Router();

ordersRouter.get('/all', getAllOrders);
ordersRouter.get('/:orderId', getOrder);
ordersRouter.post('/create', createUserOrder);
ordersRouter.put('/cancel/:orderId', cancelOrder);
ordersRouter.post('/webhook', webhookHandler);


export default ordersRouter;
