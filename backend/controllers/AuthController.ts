import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { sendSuccess } from '../utils/apiResponse';
import { BadRequestError, UnauthorizedError } from '../utils/httpErrors';

const toUserResponse = (user: User) => {
  const { password: _password, ...safe } = user;
  return safe;
};

type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const register = async (
  req: Request<Record<string, never>, unknown, RegisterBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRepo = AppDataSource.getRepository(User);

    const existing = await userRepo.findOne({ where: { email: req.body.email } });
    if (existing) {
      throw new BadRequestError('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = userRepo.create({
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    const saved = await userRepo.save(user);

    sendSuccess(res, toUserResponse(saved), 'User registered', 201);
  } catch (error) {
    next(error);
  }
};

type LoginBody = {
  email: string;
  password: string;
};

export const login = async (
  req: Request<Record<string, never>, unknown, LoginBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: req.body.email } });

    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) throw new UnauthorizedError('Invalid email or password');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedError('JWT_SECRET is not configured');

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      { email: user.email },
      secret,
      {
        subject: user.id,
        expiresIn,
      }
    );

    sendSuccess(res, { token, user: toUserResponse(user) }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    sendSuccess(res, { loggedOut: true }, 'Logged out');
  } catch (error) {
    next(error);
  }
};
