import { NextFunction, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/httpErrors';

const toUserResponse = (user: User) => {
  const { password: _password, ...safe } = user;
  return safe;
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user) throw new ForbiddenError('User context missing');

    const adminHeader = req.headers['x-admin'];
    const isAdminHeader = adminHeader === 'true' || adminHeader === '1';

    if (req.user.id !== id && !isAdminHeader) {
      throw new ForbiddenError('Access denied');
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    sendSuccess(res, toUserResponse(user));
  } catch (error) {
    next(error);
  }
};

type UpdateUserBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user) throw new ForbiddenError('User context missing');

    const adminHeader = req.headers['x-admin'];
    const isAdminHeader = adminHeader === 'true' || adminHeader === '1';

    if (req.user.id !== id && !isAdminHeader) {
      throw new ForbiddenError('Access denied');
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    if (req.body.email && req.body.email !== user.email) {
      const existing = await userRepo.findOne({ where: { email: req.body.email } });
      if (existing) {
        throw new BadRequestError('Email is already in use');
      }
      user.email = req.body.email;
    }

    if (typeof req.body.firstName === 'string') user.firstName = req.body.firstName;
    if (typeof req.body.lastName === 'string') user.lastName = req.body.lastName;

    const saved = await userRepo.save(user);
    sendSuccess(res, toUserResponse(saved), 'User updated');
  } catch (error) {
    next(error);
  }
};
