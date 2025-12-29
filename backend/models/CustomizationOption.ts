import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { numericTransformer } from '../utils/columnTransformers';
import { Car } from './Car';
import { SavedConfigurationItem } from './SavedConfigurationItem';
import { CustomizationCategory } from './enums';

@Entity('customization_options')
export class CustomizationOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  carId!: string;

  @ManyToOne(() => Car, (car) => car.customizationOptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carId' })
  car!: Car;

  @Column({ type: 'enum', enum: CustomizationCategory })
  category!: CustomizationCategory;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  price!: number;

  @Column({ nullable: true })
  colorHex!: string | null;

  @Column({ nullable: true })
  modelUrl!: string | null;

  @Column({ nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  specs!: CustomizationSpecs | null;

  @Column({ type: 'jsonb', nullable: true })
  compatibility!: CustomizationCompatibility | null;

  @Column({ type: 'jsonb', nullable: true })
  positionConfig!: PositionConfig | null;

  @Column({ nullable: true })
  thumbnailUrl!: string | null;

  @Column({ default: true })
  isAvailable!: boolean;

  @Column({ default: false })
  isPremium!: boolean;

  @OneToMany(() => SavedConfigurationItem, (item) => item.customizationOption)
  savedConfigurationItems!: SavedConfigurationItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}

export type CustomizationSpecs = {
  // Paint specs
  paintFinish?: 'MATTE' | 'GLOSSY' | 'METALLIC' | 'PEARL';
  
  // Wheel specs
  wheelSize?: string;
  wheelOffset?: string;
  boltPattern?: string;
  wheelFinish?: 'CHROME' | 'MATTE_BLACK' | 'POLISHED' | 'PAINTED';
  tireType?: 'SPORT' | 'ALL_SEASON' | 'WINTER' | 'TRACK';
  tireSize?: string;
  
  // Body kit specs
  bodyKitPiece?: 'FRONT_BUMPER' | 'REAR_BUMPER' | 'SIDE_SKIRTS' | 'FENDER_FLARES' | 'HOOD' | 'DIFFUSER' | 'SPLITTER';
  bodyKitComplete?: boolean;
  
  // Spoiler specs
  spoilerType?: 'GT' | 'CARBON' | 'RACING' | 'STOCK' | 'NONE';
  spoilerMaterial?: 'ABS_PLASTIC' | 'CARBON_FIBER' | 'ALUMINUM' | 'FIBERGLASS';
  spoilerPosition?: 'LOW' | 'MID' | 'HIGH' | 'LIP';
  spoilerAdjustable?: boolean;
  
  // Decal specs
  decalType?: 'STRIPE' | 'LOGO' | 'GRAPHIC' | 'NUMBER' | 'CUSTOM';
  decalCategory?: 'RACING_STRIPES' | 'FLAMES' | 'SKULLS' | 'GEOMETRIC' | 'TEXT' | 'LOGOS' | 'FLAG' | 'OTHER';
  decalPlacementZones?: string[];
  decalMaxSize?: number;
};

export type CustomizationCompatibility = {
  carModels?: string[];
  carYears?: { min?: number; max?: number };
  incompatibleWith?: string[];
  requiredOptions?: string[];
  wheelSizeRange?: { min: number; max: number };
  bodyKitRequired?: string;
  spoilerPositions?: string[];
};

export type PositionConfig = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  parentPart?: string;
};
