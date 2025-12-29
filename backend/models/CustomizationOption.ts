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

  @OneToMany(() => SavedConfigurationItem, (item) => item.customizationOption)
  savedConfigurationItems!: SavedConfigurationItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
