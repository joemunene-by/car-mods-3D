import { useState, useEffect, useCallback } from 'react';
import { CustomizationCategory } from '../../../../backend/models/enums';
import { PaintZone, WheelCustomization, BodyKitPiece, SpoilerCustomization } from '../store/customizationStore';

export interface CustomizationOption {
  id: string;
  name: string;
  category: CustomizationCategory;
  price: number;
  colorHex?: string;
  modelUrl?: string;
  imageUrl?: string;
  description?: string;
}

export interface CustomizationGroup {
  category: CustomizationCategory;
  options: CustomizationOption[];
}

export const useCustomizationOptions = (carId: string | null) => {
  const [options, setOptions] = useState<CustomizationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    if (!carId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/cars/${carId}/customizations`);
      if (!response.ok) throw new Error('Failed to fetch customization options');

      const data = await response.json();
      const groupedOptions = groupOptionsByCategory(data);
      
      setOptions(groupedOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const refetch = useCallback(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    isLoading,
    error,
    refetch,
  };
};

// Helper function to group options by category
function groupOptionsByCategory(options: CustomizationOption[]): CustomizationGroup[] {
  const groups: { [key: string]: CustomizationGroup } = {};
  
  options.forEach(option => {
    const categoryKey = option.category;
    if (!groups[categoryKey]) {
      groups[categoryKey] = {
        category: option.category,
        options: [],
      };
    }
    groups[categoryKey].options.push(option);
  });
  
  return Object.values(groups);
}

// Hook for saving configurations
export const useSaveConfiguration = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const saveConfiguration = useCallback(async (configuration: {
    carId: string;
    paintZones: PaintZone[];
    wheels: WheelCustomization | null;
    bodyKit: BodyKitPiece[];
    spoiler: SpoilerCustomization | null;
    totalPrice: number;
  }) => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuration),
      });

      if (!response.ok) throw new Error('Failed to save configuration');

      const result = await response.json();
      setSavedId(result.id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    saveConfiguration,
    isSaving,
    error,
    savedId,
  };
};

// Hook for loading configurations
export const useLoadConfiguration = (configId: string) => {
  const [configuration, setConfiguration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfiguration = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/configurations/${configId}`);
      if (!response.ok) throw new Error('Failed to load configuration');

      const data = await response.json();
      setConfiguration(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [configId]);

  useEffect(() => {
    if (configId) {
      loadConfiguration();
    }
  }, [configId, loadConfiguration]);

  return {
    configuration,
    isLoading,
    error,
    loadConfiguration,
  };
};