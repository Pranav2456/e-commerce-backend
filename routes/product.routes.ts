import { Router } from 'express';
import { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/index';
import { checkRole } from '../middlewares/index';

const productsRouter = Router();

productsRouter.get('/all', getAllProducts);
productsRouter.get('/:productId', getProduct);
productsRouter.post('/create', checkRole(['admin']), createProduct);
productsRouter.put('/update/:productId', checkRole(['admin']), updateProduct);
productsRouter.delete('/delete/:productId', checkRole(['admin']), deleteProduct);

export default productsRouter;
