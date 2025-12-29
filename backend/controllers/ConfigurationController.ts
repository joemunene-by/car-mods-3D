import { NextFunction, Response } from 'express';
import { AppDataSource } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { Car } from '../models/Car';
import { CustomizationOption } from '../models/CustomizationOption';
import { SavedConfiguration } from '../models/SavedConfiguration';
import { SavedConfigurationItem } from '../models/SavedConfigurationItem';
import { sendSuccess } from '../utils/apiResponse';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/httpErrors';
import { calculateConfigurationTotal } from '../utils/pricing';

export const getConfigurationsForUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (!req.user) throw new ForbiddenError('User context missing');
    if (req.user.id !== userId) throw new ForbiddenError('Access denied');

    const configRepo = AppDataSource.getRepository(SavedConfiguration);
    const configs = await configRepo.find({
      where: { userId },
      relations: {
        car: true,
      },
      order: { updatedAt: 'DESC' },
    });

    sendSuccess(res, configs);
  } catch (error) {
    next(error);
  }
};

export const getConfigurationById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user) throw new ForbiddenError('User context missing');

    const configRepo = AppDataSource.getRepository(SavedConfiguration);
    const config = await configRepo.findOne({
      where: { id },
      relations: {
        car: true,
        user: true,
        items: {
          customizationOption: true,
        },
      },
      order: {
        items: {
          createdAt: 'DESC',
        },
      },
    });

    if (!config) throw new NotFoundError('Saved configuration not found');
    if (config.userId !== req.user.id) throw new ForbiddenError('Access denied');

    sendSuccess(res, config);
  } catch (error) {
    next(error);
  }
};

type CreateConfigurationBody = {
  userId: string;
  carId: string;
  name: string;
  description?: string | null;
  customizationOptionIds?: string[];
};

export const createConfiguration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new ForbiddenError('User context missing');

    const { userId, carId, name, description, customizationOptionIds } = req.body as CreateConfigurationBody;

    if (req.user.id !== userId) throw new ForbiddenError('Access denied');

    const carRepo = AppDataSource.getRepository(Car);
    const car = await carRepo.findOne({ where: { id: carId } });
    if (!car) throw new NotFoundError('Car not found');

    const configRepo = AppDataSource.getRepository(SavedConfiguration);
    const itemRepo = AppDataSource.getRepository(SavedConfigurationItem);
    const optionRepo = AppDataSource.getRepository(CustomizationOption);

    const optionIds = Array.from(new Set((customizationOptionIds ?? []).filter(Boolean)));

    const options = optionIds.length
      ? await optionRepo.find({ where: optionIds.map((optId) => ({ id: optId, carId })) })
      : [];

    if (optionIds.length !== options.length) {
      throw new BadRequestError('One or more customization options are invalid for this car');
    }

    const config = configRepo.create({
      userId,
      carId,
      name,
      description: description ?? null,
      basePrice: car.basePrice,
      totalPrice: car.basePrice,
    });

    const savedConfig = await configRepo.save(config);

    if (options.length) {
      const items = options.map((opt) =>
        itemRepo.create({
          savedConfigurationId: savedConfig.id,
          customizationOptionId: opt.id,
        })
      );

      await itemRepo.save(items);
    }

    const reloaded = await configRepo.findOne({
      where: { id: savedConfig.id },
      relations: { items: { customizationOption: true }, car: true },
    });

    if (!reloaded) throw new NotFoundError('Saved configuration not found');

    reloaded.totalPrice = calculateConfigurationTotal(reloaded);
    await configRepo.save(reloaded);

    sendSuccess(res, reloaded, 'Saved configuration created', 201);
  } catch (error) {
    next(error);
  }
};

type UpdateConfigurationBody = {
  name?: string;
  description?: string | null;
  customizationOptionIds?: string[];
};

export const updateConfiguration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user) throw new ForbiddenError('User context missing');

    const configRepo = AppDataSource.getRepository(SavedConfiguration);
    const itemRepo = AppDataSource.getRepository(SavedConfigurationItem);
    const optionRepo = AppDataSource.getRepository(CustomizationOption);

    const config = await configRepo.findOne({
      where: { id },
      relations: { items: { customizationOption: true } },
    });

    if (!config) throw new NotFoundError('Saved configuration not found');
    if (config.userId !== req.user.id) throw new ForbiddenError('Access denied');

    if (typeof req.body.name === 'string') config.name = req.body.name;
    if ('description' in req.body) config.description = req.body.description ?? null;

    if (Array.isArray(req.body.customizationOptionIds)) {
      const optionIds = Array.from(new Set(req.body.customizationOptionIds.filter(Boolean)));
      const options = optionIds.length
        ? await optionRepo.find({ where: optionIds.map((optId) => ({ id: optId, carId: config.carId })) })
        : [];

      if (optionIds.length !== options.length) {
        throw new BadRequestError('One or more customization options are invalid for this car');
      }

      await itemRepo.delete({ savedConfigurationId: config.id });

      if (options.length) {
        const items = options.map((opt) =>
          itemRepo.create({
            savedConfigurationId: config.id,
            customizationOptionId: opt.id,
          })
        );
        await itemRepo.save(items);
      }

      const refreshed = await configRepo.findOne({
        where: { id: config.id },
        relations: { items: { customizationOption: true } },
      });

      if (!refreshed) throw new NotFoundError('Saved configuration not found');

      config.items = refreshed.items;
    }

    config.totalPrice = calculateConfigurationTotal(config);

    const saved = await configRepo.save(config);
    sendSuccess(res, saved, 'Saved configuration updated');
  } catch (error) {
    next(error);
  }
};

export const deleteConfiguration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!req.user) throw new ForbiddenError('User context missing');

    const configRepo = AppDataSource.getRepository(SavedConfiguration);
    const config = await configRepo.findOne({ where: { id } });

    if (!config) throw new NotFoundError('Saved configuration not found');
    if (config.userId !== req.user.id) throw new ForbiddenError('Access denied');

    await configRepo.softDelete({ id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

type AddItemBody = {
  customizationOptionId: string;
};

export const addItemToConfiguration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user) throw new ForbiddenError('User context missing');

    const configRepo = AppDataSource.getRepository(SavedConfiguration);
    const itemRepo = AppDataSource.getRepository(SavedConfigurationItem);
    const optionRepo = AppDataSource.getRepository(CustomizationOption);

    const config = await configRepo.findOne({
      where: { id },
      relations: { items: { customizationOption: true } },
    });

    if (!config) throw new NotFoundError('Saved configuration not found');
    if (config.userId !== req.user.id) throw new ForbiddenError('Access denied');

    const { customizationOptionId } = req.body as AddItemBody;

    const option = await optionRepo.findOne({ where: { id: customizationOptionId } });
    if (!option) throw new NotFoundError('Customization option not found');
    if (option.carId !== config.carId) {
      throw new BadRequestError('Customization option does not belong to this car');
    }

    const existing = await itemRepo.findOne({
      where: { savedConfigurationId: config.id, customizationOptionId: option.id },
    });

    if (existing) {
      throw new BadRequestError('Customization option already added');
    }

    const item = itemRepo.create({
      savedConfigurationId: config.id,
      customizationOptionId: option.id,
    });

    await itemRepo.save(item);

    const refreshed = await configRepo.findOne({
      where: { id: config.id },
      relations: { items: { customizationOption: true }, car: true },
    });

    if (!refreshed) throw new NotFoundError('Saved configuration not found');

    refreshed.totalPrice = calculateConfigurationTotal(refreshed);
    await configRepo.save(refreshed);

    sendSuccess(res, refreshed, 'Item added');
  } catch (error) {
    next(error);
  }
};

export const removeItemFromConfiguration = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, itemId } = req.params;

    if (!req.user) throw new ForbiddenError('User context missing');

    const configRepo = AppDataSource.getRepository(SavedConfiguration);
    const itemRepo = AppDataSource.getRepository(SavedConfigurationItem);

    const config = await configRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundError('Saved configuration not found');
    if (config.userId !== req.user.id) throw new ForbiddenError('Access denied');

    const item = await itemRepo.findOne({
      where: { id: itemId, savedConfigurationId: config.id },
    });

    if (!item) throw new NotFoundError('Configuration item not found');

    await itemRepo.delete({ id: item.id });

    const refreshed = await configRepo.findOne({
      where: { id: config.id },
      relations: { items: { customizationOption: true }, car: true },
    });

    if (!refreshed) throw new NotFoundError('Saved configuration not found');

    refreshed.totalPrice = calculateConfigurationTotal(refreshed);
    await configRepo.save(refreshed);

    sendSuccess(res, refreshed, 'Item removed');
  } catch (error) {
    next(error);
  }
};
