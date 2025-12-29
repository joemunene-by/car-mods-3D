import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Car } from '../models/Car';
import { CustomizationOption } from '../models/CustomizationOption';
import { CustomizationCategory } from '../models/enums';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError } from '../utils/httpErrors';

export const getCustomizationsForCar = async (
  req: Request<{ carId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { carId } = req.params;

    const carRepo = AppDataSource.getRepository(Car);
    const car = await carRepo.findOne({ where: { id: carId } });
    if (!car) throw new NotFoundError('Car not found');

    const customizationRepo = AppDataSource.getRepository(CustomizationOption);
    const options = await customizationRepo.find({
      where: { carId },
      order: { createdAt: 'DESC' },
    });

    sendSuccess(res, options);
  } catch (error) {
    next(error);
  }
};

export const getCustomizationById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const customizationRepo = AppDataSource.getRepository(CustomizationOption);
    const option = await customizationRepo.findOne({
      where: { id },
      relations: { car: true },
    });

    if (!option) throw new NotFoundError('Customization option not found');

    sendSuccess(res, option);
  } catch (error) {
    next(error);
  }
};

type CreateCustomizationBody = {
  carId: string;
  category: CustomizationCategory;
  name: string;
  description?: string | null;
  price: number;
  colorHex?: string | null;
  modelUrl?: string | null;
  imageUrl?: string | null;
};

export const createCustomization = async (
  req: Request<Record<string, never>, unknown, CreateCustomizationBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const carRepo = AppDataSource.getRepository(Car);
    const car = await carRepo.findOne({ where: { id: req.body.carId } });
    if (!car) throw new NotFoundError('Car not found');

    const customizationRepo = AppDataSource.getRepository(CustomizationOption);

    const option = customizationRepo.create({
      carId: req.body.carId,
      category: req.body.category,
      name: req.body.name,
      description: req.body.description ?? null,
      price: req.body.price,
      colorHex: req.body.colorHex ?? null,
      modelUrl: req.body.modelUrl ?? null,
      imageUrl: req.body.imageUrl ?? null,
    });

    const saved = await customizationRepo.save(option);
    sendSuccess(res, saved, 'Customization option created', 201);
  } catch (error) {
    next(error);
  }
};

type UpdateCustomizationBody = Partial<CreateCustomizationBody>;

export const updateCustomization = async (
  req: Request<{ id: string }, unknown, UpdateCustomizationBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const customizationRepo = AppDataSource.getRepository(CustomizationOption);
    const option = await customizationRepo.findOne({ where: { id } });
    if (!option) throw new NotFoundError('Customization option not found');

    if (req.body.carId && req.body.carId !== option.carId) {
      const carRepo = AppDataSource.getRepository(Car);
      const car = await carRepo.findOne({ where: { id: req.body.carId } });
      if (!car) throw new NotFoundError('Car not found');
    }

    const patch: Partial<CustomizationOption> = { ...req.body };

    if ('description' in req.body) patch.description = req.body.description ?? null;
    if ('colorHex' in req.body) patch.colorHex = req.body.colorHex ?? null;
    if ('modelUrl' in req.body) patch.modelUrl = req.body.modelUrl ?? null;
    if ('imageUrl' in req.body) patch.imageUrl = req.body.imageUrl ?? null;

    customizationRepo.merge(option, patch);

    const saved = await customizationRepo.save(option);
    sendSuccess(res, saved, 'Customization option updated');
  } catch (error) {
    next(error);
  }
};

export const deleteCustomization = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const customizationRepo = AppDataSource.getRepository(CustomizationOption);
    const result = await customizationRepo.softDelete({ id });

    if (!result.affected) {
      throw new NotFoundError('Customization option not found');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
