import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../utils/httpErrors';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => `${err.type === 'field' ? err.path : 'request'}: ${err.msg}`)
      .join(', ');

    return next(new BadRequestError(message));
  }

  next();
};
