import { Request } from 'express';
import { IUsers } from './models.types';

export type Status = 'idle' | 'loading' | 'success' | 'fail' | 'error';

export type RequestWithUser = Request & {
    user?: IUsers;
};

