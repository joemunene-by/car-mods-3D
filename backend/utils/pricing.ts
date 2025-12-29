import { SavedConfiguration } from '../models/SavedConfiguration';

export const calculateConfigurationTotal = (configuration: SavedConfiguration): number => {
  const itemsTotal = (configuration.items ?? []).reduce((sum, item) => {
    const price = item.customizationOption?.price ?? 0;
    return sum + price;
  }, 0);

  return (configuration.basePrice ?? 0) + itemsTotal;
};
