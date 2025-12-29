import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { CustomizationCategory } from '../types/enums';

export type CustomizationOption = {
  id: string;
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
  compatibility: Record<string, unknown> | null;
  positionConfig: Record<string, unknown> | null;
  isAvailable: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  status: string;
  data: T;
  message?: string;
};

export const useCustomizations = (carId: string | null) => {
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const refetch = useCallback(() => setReloadIndex((x) => x + 1), []);

  useEffect(() => {
    if (!carId) {
      setOptions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCustomizations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse<CustomizationOption[]>>(
          `/api/customizations/car/${carId}`
        );
        if (cancelled) return;
        setOptions(response.data.data);
      } catch (err) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch customizations');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch customizations');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCustomizations();

    return () => {
      cancelled = true;
    };
  }, [carId, reloadIndex]);

  return { options, isLoading, error, refetch };
};

export const useCustomizationsByCategory = (carId: string | null, category: CustomizationCategory | null) => {
  const [options, setOptions] = useState<CustomizationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const refetch = useCallback(() => setReloadIndex((x) => x + 1), []);

  useEffect(() => {
    if (!carId || !category) {
      setOptions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCustomizations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse<CustomizationOption[]>>(
          `/api/customizations/car/${carId}/category/${category}`
        );
        if (cancelled) return;
        setOptions(response.data.data);
      } catch (err) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch customizations');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch customizations');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCustomizations();

    return () => {
      cancelled = true;
    };
  }, [carId, category, reloadIndex]);

  return { options, isLoading, error, refetch };
};

export const getCustomizationById = async (id: string): Promise<CustomizationOption> => {
  const response = await axios.get<ApiResponse<CustomizationOption>>(`/api/customizations/${id}`);
  return response.data.data;
};

export const createCustomization = async (data: {
  carId: string;
  category: CustomizationCategory;
  name: string;
  description?: string;
  price: number;
  colorHex?: string;
  modelUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  specs?: Record<string, unknown>;
  compatibility?: Record<string, unknown>;
  positionConfig?: Record<string, unknown>;
  isAvailable?: boolean;
  isPremium?: boolean;
}): Promise<CustomizationOption> => {
  const response = await axios.post<ApiResponse<CustomizationOption>>('/api/customizations', data);
  return response.data.data;
};

export const updateCustomization = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    colorHex: string;
    modelUrl: string;
    imageUrl: string;
    thumbnailUrl: string;
    specs: Record<string, unknown>;
    compatibility: Record<string, unknown>;
    positionConfig: Record<string, unknown>;
    isAvailable: boolean;
    isPremium: boolean;
  }>
): Promise<CustomizationOption> => {
  const response = await axios.put<ApiResponse<CustomizationOption>>(`/api/customizations/${id}`, data);
  return response.data.data;
};

export const deleteCustomization = async (id: string): Promise<void> => {
  await axios.delete(`/api/customizations/${id}`);
};
