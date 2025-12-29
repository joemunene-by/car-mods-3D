import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { SavedConfiguration } from './SavedConfiguration';
import { CustomizationOption } from './CustomizationOption';

@Entity('saved_configuration_items')
@Unique('uq_configuration_option', ['savedConfigurationId', 'customizationOptionId'])
export class SavedConfigurationItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  savedConfigurationId!: string;

  @ManyToOne(() => SavedConfiguration, (configuration) => configuration.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'savedConfigurationId' })
  savedConfiguration!: SavedConfiguration;

  @Index()
  @Column('uuid')
  customizationOptionId!: string;

  @ManyToOne(() => CustomizationOption, (option) => option.savedConfigurationItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customizationOptionId' })
  customizationOption!: CustomizationOption;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
