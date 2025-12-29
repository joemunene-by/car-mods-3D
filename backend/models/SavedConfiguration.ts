import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { numericTransformer } from '../utils/columnTransformers';
import { User } from './User';
import { Car } from './Car';
import { SavedConfigurationItem } from './SavedConfigurationItem';

@Entity('saved_configurations')
export class SavedConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, (user) => user.savedConfigurations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Index()
  @Column('uuid')
  carId!: string;

  @ManyToOne(() => Car, (car) => car.savedConfigurations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carId' })
  car!: Car;

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
  basePrice!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  totalPrice!: number;

  @OneToMany(() => SavedConfigurationItem, (item) => item.savedConfiguration, {
    cascade: ['insert'],
  })
  items!: SavedConfigurationItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
