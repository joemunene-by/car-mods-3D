import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { Car } from '../models/Car';
import { CustomizationOption } from '../models/CustomizationOption';
import { CustomizationCategory } from '../models/enums';

dotenv.config();

const seed = async () => {
  await AppDataSource.initialize();

  const carRepo = AppDataSource.getRepository(Car);
  const optionRepo = AppDataSource.getRepository(CustomizationOption);

  const carsData: Array<Pick<Car, 'name' | 'manufacturer' | 'year' | 'basePrice' | 'description' | 'modelUrl'>> = [
    {
      name: 'BMW M3',
      manufacturer: 'BMW',
      year: 2023,
      basePrice: 74999,
      description: 'High-performance sports sedan with iconic styling.',
      modelUrl: '/models/cars/placeholder-car.gltf',
    },
    {
      name: 'Tesla Model 3',
      manufacturer: 'Tesla',
      year: 2024,
      basePrice: 38999,
      description: 'All-electric sedan with cutting-edge tech and performance.',
      modelUrl: '/models/cars/placeholder-car.gltf',
    },
  ];

  const createdCars: Car[] = [];

  for (const carData of carsData) {
    let car = await carRepo.findOne({
      where: { name: carData.name, year: carData.year },
    });

    if (!car) {
      car = carRepo.create(carData);
      car = await carRepo.save(car);
    }

    createdCars.push(car);
  }

  const [bmwM3, teslaModel3] = createdCars;

  if (!bmwM3 || !teslaModel3) {
    throw new Error('Expected seed cars to exist');
  }

  type SeedCustomization = {
    carId: string;
    category: CustomizationCategory;
    name: string;
    description: string | null;
    price: number;
    colorHex: string | null;
    modelUrl: string | null;
    imageUrl: string | null;
  };

  const optionsData: SeedCustomization[] = [
    {
      carId: bmwM3.id,
      category: CustomizationCategory.PAINT,
      name: 'Matte Black Paint',
      description: 'Premium matte finish paint option.',
      price: 1500,
      colorHex: '#111111',
      modelUrl: null,
      imageUrl: '/images/customizations/paint/matte-black.jpg',
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.WHEELS,
      name: '19-inch Chrome Wheels',
      description: 'Chrome-finished wheels for a bold look.',
      price: 2200,
      colorHex: null,
      modelUrl: '/models/parts/wheels/19in-chrome.glb',
      imageUrl: '/images/customizations/wheels/19in-chrome.jpg',
    },
    {
      carId: teslaModel3.id,
      category: CustomizationCategory.PAINT,
      name: 'Pearl White Multi-Coat',
      description: 'Signature Tesla pearl white paint.',
      price: 1000,
      colorHex: '#f5f5f5',
      modelUrl: null,
      imageUrl: '/images/customizations/paint/pearl-white.jpg',
    },
    {
      carId: teslaModel3.id,
      category: CustomizationCategory.SPOILER,
      name: 'Carbon Fiber Spoiler',
      description: 'Lightweight spoiler for a sportier appearance.',
      price: 800,
      colorHex: null,
      modelUrl: '/models/parts/spoiler/carbon-fiber.glb',
      imageUrl: '/images/customizations/spoiler/carbon-fiber.jpg',
    },
  ];

  for (const optionData of optionsData) {
    const existing = await optionRepo.findOne({
      where: {
        carId: optionData.carId,
        category: optionData.category,
        name: optionData.name,
      },
    });

    if (!existing) {
      const option = optionRepo.create(optionData);
      await optionRepo.save(option);
    }
  }

  await AppDataSource.destroy();
};

seed()
  .then(() => {
    console.log('✅ Seed complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  });
