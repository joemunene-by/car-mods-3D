import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/httpErrors';

export interface AuthenticatedRequest extends Request {
  user?: User;
  tokenPayload?: JwtPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      return next(new UnauthorizedError('Missing authorization token'));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new UnauthorizedError('JWT_SECRET is not configured'));
    }

    const payload = jwt.verify(token, secret) as JwtPayload;
    const userId = (payload.sub as string | undefined) ?? (payload.userId as string | undefined);

    if (!userId) {
      return next(new UnauthorizedError('Invalid token payload'));
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    req.user = user;
    req.tokenPayload = payload;

    next();
  } catch (_error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const adminHeader = req.headers['x-admin'];
  const isAdminHeader = adminHeader === 'true' || adminHeader === '1';

  if (!isAdminHeader) {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
};
