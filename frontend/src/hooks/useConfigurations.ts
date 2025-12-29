import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export type SavedConfiguration = {
  id: string;
  userId: string;
  carId: string;
  name: string;
  description: string | null;
  basePrice: number;
  totalPrice: number;
  items: SavedConfigurationItem[];
  createdAt: string;
  updatedAt: string;
};

export type SavedConfigurationItem = {
  id: string;
  customizationOptionId: string;
  customizationOption: {
    id: string;
    name: string;
    price: number;
    category: string;
    colorHex: string | null;
    modelUrl: string | null;
    imageUrl: string | null;
  };
  createdAt: string;
};

type ApiResponse<T> = {
  status: string;
  data: T;
  message?: string;
};

export const useConfigurations = (userId: string | null) => {
  const [configurations, setConfigurations] = useState<SavedConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const refetch = useCallback(() => setReloadIndex((x) => x + 1), []);

  useEffect(() => {
    if (!userId) {
      setConfigurations([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchConfigurations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse<SavedConfiguration[]>>(
          `/api/configurations/user/${userId}`
        );
        if (cancelled) return;
        setConfigurations(response.data.data);
      } catch (err) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch configurations');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch configurations');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchConfigurations();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadIndex]);

  return { configurations, isLoading, error, refetch };
};

export const useConfiguration = () => {
  return { configuration: null, isLoading: false, error: null, refetch: () => {} };
};

export const saveConfiguration = async (data: {
  userId: string;
  carId: string;
  name: string;
  description?: string;
  customizationOptionIds?: string[];
}): Promise<SavedConfiguration> => {
  const response = await axios.post<ApiResponse<SavedConfiguration>>('/api/configurations', data);
  return response.data.data;
};

export const updateConfiguration = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    customizationOptionIds: string[];
  }>
): Promise<SavedConfiguration> => {
  const response = await axios.put<ApiResponse<SavedConfiguration>>(`/api/configurations/${id}`, data);
  return response.data.data;
};

export const deleteConfiguration = async (id: string): Promise<void> => {
  await axios.delete(`/api/configurations/${id}`);
};

export const addItemToConfiguration = async (
  configurationId: string,
  customizationOptionId: string
): Promise<SavedConfiguration> => {
  const response = await axios.post<ApiResponse<SavedConfiguration>>(
    `/api/configurations/${configurationId}/items`,
    { customizationOptionId }
  );
  return response.data.data;
};

export const removeItemFromConfiguration = async (
  configurationId: string,
  itemId: string
): Promise<SavedConfiguration> => {
  const response = await axios.delete<ApiResponse<SavedConfiguration>>(
    `/api/configurations/${configurationId}/items/${itemId}`
  );
  return response.data.data;
};
