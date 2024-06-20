import { Router } from 'express';
import { registerUser, loginUser, updateUser, changePassword, addAddress, updateAddress, deleteAddress } from '../controllers/index';
import { authMiddleware } from '../middlewares/index';

const usersRouter = Router();

usersRouter.post('/register', registerUser);
usersRouter.post('/login', loginUser);
usersRouter.put('/update', authMiddleware, updateUser);
usersRouter.put('/change-password', authMiddleware, changePassword);
usersRouter.post('/add-address', authMiddleware, addAddress);
usersRouter.put('/update-address', authMiddleware, updateAddress);
usersRouter.delete('/delete-address', authMiddleware, deleteAddress);

export default usersRouter;
