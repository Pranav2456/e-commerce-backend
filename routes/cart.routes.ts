import { Router } from 'express';
import { addToCart, clearCart, updateCartItemQuantity,  removeFromCart, getCart } from '../controllers/index';

const cartRouter = Router();

cartRouter.get('/get', getCart);
cartRouter.post('/add', addToCart);
cartRouter.put('/update', updateCartItemQuantity);
cartRouter.delete('/:productId', removeFromCart);
cartRouter.delete('/clear', clearCart);

export default cartRouter;

