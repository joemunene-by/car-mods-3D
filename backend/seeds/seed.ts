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
    {
      name: 'Porsche 911',
      manufacturer: 'Porsche',
      year: 2024,
      basePrice: 122400,
      description: 'Iconic sports car with legendary performance.',
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

  const [bmwM3, teslaModel3, porsche911] = createdCars;

  if (!bmwM3 || !teslaModel3 || !porsche911) {
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
    thumbnailUrl: string | null;
    specs: Record<string, unknown> | null;
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
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'MATTE' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.PAINT,
      name: 'Metallic Silver',
      description: 'Classic metallic silver with deep shine.',
      price: 800,
      colorHex: '#C0C0C0',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'METALLIC' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.PAINT,
      name: 'Pearl White Multi-Coat',
      description: 'Luxurious pearl white with iridescent effect.',
      price: 1200,
      colorHex: '#F5F5F5',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'PEARL' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.PAINT,
      name: 'Alpine White Gloss',
      description: 'Classic glossy white finish.',
      price: 600,
      colorHex: '#FFFFFF',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'GLOSSY' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.PAINT,
      name: 'Toronto Red Metallic',
      description: 'Vibrant red metallic with pearlescent flakes.',
      price: 1000,
      colorHex: '#CC0000',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'METALLIC' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.PAINT,
      name: 'Deep Sea Blue Metallic',
      description: 'Deep blue with metallic shimmer.',
      price: 1000,
      colorHex: '#004488',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'METALLIC' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.WHEELS,
      name: '19-inch Chrome Wheels',
      description: 'Chrome-finished wheels for a bold look.',
      price: 2200,
      colorHex: null,
      modelUrl: '/models/parts/wheels/19in-chrome.glb',
      imageUrl: null,
      thumbnailUrl: '⚙️',
      specs: { wheelSize: '19"', wheelFinish: 'CHROME' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.WHEELS,
      name: '20-inch Matte Black Performance',
      description: 'Lightweight forged wheels in matte black.',
      price: 3500,
      colorHex: null,
      modelUrl: '/models/parts/wheels/20in-matte-black.glb',
      imageUrl: null,
      thumbnailUrl: '⚙️',
      specs: { wheelSize: '20"', wheelFinish: 'MATTE_BLACK' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.WHEELS,
      name: '19-inch Polished Star Spoke',
      description: 'Classic star spoke design with polished finish.',
      price: 2800,
      colorHex: null,
      modelUrl: '/models/parts/wheels/19in-polished.glb',
      imageUrl: null,
      thumbnailUrl: '⚙️',
      specs: { wheelSize: '19"', wheelFinish: 'POLISHED' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.SPOILER,
      name: 'Carbon Fiber GT Wing',
      description: 'High-performance GT wing in carbon fiber.',
      price: 2800,
      colorHex: null,
      modelUrl: '/models/parts/spoiler/gt-wing-carbon.glb',
      imageUrl: null,
      thumbnailUrl: '🏁',
      specs: { spoilerType: 'GT', spoilerMaterial: 'CARBON_FIBER', spoilerAdjustable: true },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.SPOILER,
      name: 'Aluminum GT Wing',
      description: 'Classic GT wing in polished aluminum.',
      price: 2200,
      colorHex: null,
      modelUrl: '/models/parts/spoiler/gt-wing-alum.glb',
      imageUrl: null,
      thumbnailUrl: '🏁',
      specs: { spoilerType: 'GT', spoilerMaterial: 'ALUMINUM', spoilerAdjustable: true },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.SPOILER,
      name: 'Carbon Racing Spoiler',
      description: 'Aggressive racing spoiler in carbon fiber.',
      price: 3500,
      colorHex: null,
      modelUrl: '/models/parts/spoiler/racing-carbon.glb',
      imageUrl: null,
      thumbnailUrl: '🏁',
      specs: { spoilerType: 'RACING', spoilerMaterial: 'CARBON_FIBER', spoilerAdjustable: false },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.BODY_KIT,
      name: 'Sport Body Kit',
      description: 'Subtle aerodynamic enhancement package.',
      price: 3500,
      colorHex: null,
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: '🚗',
      specs: { bodyKitComplete: true, bodyKitPiece: 'FRONT_BUMPER' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.BODY_KIT,
      name: 'Track Performance Kit',
      description: 'Complete aerodynamic package for track use.',
      price: 8500,
      colorHex: null,
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: '🏁',
      specs: { bodyKitComplete: true },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.DECAL,
      name: 'Racing Stripe Kit',
      description: 'Classic racing stripe decal kit.',
      price: 250,
      colorHex: '#FFFFFF',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: '｜',
      specs: { decalType: 'STRIPE', decalCategory: 'RACING_STRIPES' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.DECAL,
      name: 'Double Racing Stripes',
      description: 'Dual racing stripe decal kit.',
      price: 350,
      colorHex: '#FFFFFF',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: '║║',
      specs: { decalType: 'STRIPE', decalCategory: 'RACING_STRIPES' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.DECAL,
      name: 'Flame Graphics',
      description: 'Flame graphic decal kit.',
      price: 500,
      colorHex: '#FF6600',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: '🔥',
      specs: { decalType: 'GRAPHIC', decalCategory: 'FLAMES' },
    },
    {
      carId: bmwM3.id,
      category: CustomizationCategory.DECAL,
      name: 'Racing Number Decal',
      description: 'Custom racing number decal.',
      price: 100,
      colorHex: '#FFFFFF',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: '1',
      specs: { decalType: 'NUMBER', decalCategory: 'RACING_STRIPES' },
    },
    {
      carId: teslaModel3.id,
      category: CustomizationCategory.PAINT,
      name: 'Pearl White Multi-Coat',
      description: 'Signature Tesla pearl white paint.',
      price: 1000,
      colorHex: '#f5f5f5',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'PEARL' },
    },
    {
      carId: teslaModel3.id,
      category: CustomizationCategory.PAINT,
      name: 'Midnight Silver Metallic',
      description: 'Sleek midnight silver finish.',
      price: 1000,
      colorHex: '#444444',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'METALLIC' },
    },
    {
      carId: teslaModel3.id,
      category: CustomizationCategory.PAINT,
      name: 'Deep Blue Metallic',
      description: 'Deep blue with metallic flakes.',
      price: 1000,
      colorHex: '#003366',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'METALLIC' },
    },
    {
      carId: teslaModel3.id,
      category: CustomizationCategory.WHEELS,
      name: '20-inch Induction Wheels',
      description: 'Premium 20-inch turbine-style wheels.',
      price: 4500,
      colorHex: null,
      modelUrl: '/models/parts/wheels/20in-tesla.glb',
      imageUrl: null,
      thumbnailUrl: '⚙️',
      specs: { wheelSize: '20"', wheelFinish: 'POLISHED' },
    },
    {
      carId: teslaModel3.id,
      category: CustomizationCategory.SPOILER,
      name: 'Carbon Fiber Spoiler',
      description: 'Lightweight spoiler for a sportier appearance.',
      price: 800,
      colorHex: null,
      modelUrl: '/models/parts/spoiler/carbon-fiber.glb',
      imageUrl: null,
      thumbnailUrl: '🏁',
      specs: { spoilerType: 'GT', spoilerMaterial: 'CARBON_FIBER' },
    },
    {
      carId: porsche911.id,
      category: CustomizationCategory.PAINT,
      name: 'GT Silver Metallic',
      description: 'Classic Porsche GT silver.',
      price: 1500,
      colorHex: '#C0C0C0',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'METALLIC' },
    },
    {
      carId: porsche911.id,
      category: CustomizationCategory.PAINT,
      name: 'Racing Yellow',
      description: 'Iconic Porsche racing yellow.',
      price: 1200,
      colorHex: '#FFD700',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'GLOSSY' },
    },
    {
      carId: porsche911.id,
      category: CustomizationCategory.PAINT,
      name: 'Miami Blue',
      description: 'Vibrant Miami blue finish.',
      price: 2500,
      colorHex: '#00AADD',
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: null,
      specs: { paintFinish: 'METALLIC' },
    },
    {
      carId: porsche911.id,
      category: CustomizationCategory.WHEELS,
      name: '20-inch RS Spyder Wheels',
      description: 'Authentic RS Spyder wheel design.',
      price: 5000,
      colorHex: null,
      modelUrl: '/models/parts/wheels/20in-rs-spyder.glb',
      imageUrl: null,
      thumbnailUrl: '⚙️',
      specs: { wheelSize: '20"', wheelFinish: 'POLISHED' },
    },
    {
      carId: porsche911.id,
      category: CustomizationCategory.BODY_KIT,
      name: 'Aerokit Cup',
      description: 'Track-focused aerodynamics package.',
      price: 12000,
      colorHex: null,
      modelUrl: null,
      imageUrl: null,
      thumbnailUrl: '🏁',
      specs: { bodyKitComplete: true },
    },
    {
      carId: porsche911.id,
      category: CustomizationCategory.SPOILER,
      name: 'Carbon Ducktail',
      description: 'Classic 911 ducktail in carbon fiber.',
      price: 4500,
      colorHex: null,
      modelUrl: '/models/parts/spoiler/ducktail-carbon.glb',
      imageUrl: null,
      thumbnailUrl: '🏁',
      specs: { spoilerType: 'GT', spoilerMaterial: 'CARBON_FIBER', spoilerAdjustable: false },
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
