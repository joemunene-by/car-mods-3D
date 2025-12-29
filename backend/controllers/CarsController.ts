import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Car } from '../models/Car';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/httpErrors';

export const getCars = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const carRepo = AppDataSource.getRepository(Car);
    const cars = await carRepo.find({
      order: { createdAt: 'DESC' },
    });

    sendSuccess(res, cars);
  } catch (error) {
    next(error);
  }
};

export const getCarById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const carRepo = AppDataSource.getRepository(Car);
    const car = await carRepo.findOne({
      where: { id },
      relations: {
        customizationOptions: true,
      },
      order: {
        customizationOptions: {
          createdAt: 'DESC',
        },
      },
    });

    if (!car) {
      throw new NotFoundError('Car not found');
    }

    sendSuccess(res, car);
  } catch (error) {
    next(error);
  }
};

type CreateCarBody = {
  name: string;
  manufacturer: string;
  year: number;
  basePrice: number;
  description?: string | null;
  modelUrl?: string | null;
};

export const createCar = async (
  req: Request<Record<string, never>, unknown, CreateCarBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const carRepo = AppDataSource.getRepository(Car);

    const car = carRepo.create({
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      year: req.body.year,
      basePrice: req.body.basePrice,
      description: req.body.description ?? null,
      modelUrl: req.body.modelUrl ?? null,
    });

    const saved = await carRepo.save(car);
    sendSuccess(res, saved, 'Car created', 201);
  } catch (error) {
    next(error);
  }
};

type UpdateCarBody = Partial<CreateCarBody>;

export const updateCar = async (
  req: Request<{ id: string }, unknown, UpdateCarBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const carRepo = AppDataSource.getRepository(Car);

    const car = await carRepo.findOne({ where: { id } });
    if (!car) {
      throw new NotFoundError('Car not found');
    }

    const patch: Partial<Car> = { ...req.body };

    if ('description' in req.body) {
      patch.description = req.body.description ?? null;
    }

    if ('modelUrl' in req.body) {
      patch.modelUrl = req.body.modelUrl ?? null;
    }

    carRepo.merge(car, patch);

    const saved = await carRepo.save(car);
    sendSuccess(res, saved, 'Car updated');
  } catch (error) {
    next(error);
  }
};

export const deleteCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const carRepo = AppDataSource.getRepository(Car);
    const result = await carRepo.softDelete({ id });

    if (!result.affected) {
      throw new NotFoundError('Car not found');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
