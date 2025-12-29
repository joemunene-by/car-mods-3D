import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { numericTransformer } from '../utils/columnTransformers';
import { CustomizationOption } from './CustomizationOption';
import { SavedConfiguration } from './SavedConfiguration';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  manufacturer!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  basePrice!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ nullable: true })
  modelUrl!: string | null;

  @OneToMany(() => CustomizationOption, (option) => option.car)
  customizationOptions!: CustomizationOption[];

  @OneToMany(() => SavedConfiguration, (configuration) => configuration.car)
  savedConfigurations!: SavedConfiguration[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
