import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ModelLoader } from '../three-viewer/ModelLoader';
import type { LoadedModel } from '../three-viewer/ModelLoader';

export type Car = {
  id: string;
  name: string;
  manufacturer: string;
  year: number;
  basePrice: number;
  description: string | null;
  modelUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  status: string;
  data: T;
  message?: string;
};

export const useCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const refetch = useCallback(() => setReloadIndex((x) => x + 1), []);

  useEffect(() => {
    let cancelled = false;

    const fetchCars = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse<Car[]>>('/api/cars');
        if (cancelled) return;
        setCars(response.data.data);
      } catch (err) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch cars');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch cars');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCars();

    return () => {
      cancelled = true;
    };
  }, [reloadIndex]);

  return { cars, isLoading, error, refetch };
};

export const useCarModel = (carId: string | null) => {
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadIndex, setReloadIndex] = useState(0);

  const requestIdRef = useRef(0);

  const reload = useCallback(() => setReloadIndex((x) => x + 1), []);

  useEffect(() => {
    if (!carId) {
      setModel(null);
      setCar(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setModel(null);
    setCar(null);

    const modelLoader = new ModelLoader();
    const requestId = ++requestIdRef.current;

    const loadCarModel = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse<Car>>(`/api/cars/${carId}`);
        if (requestIdRef.current != requestId) return;

        const carData = response.data.data;
        setCar(carData);

        if (!carData.modelUrl) {
          throw new Error('Car has no 3D model URL');
        }

        const loadedModel = await modelLoader.load(carData.modelUrl, 4);
        if (requestIdRef.current != requestId) {
          loadedModel.dispose();
          return;
        }

        setModel(loadedModel);
      } catch (err) {
        if (requestIdRef.current != requestId) return;

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to load car');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load car model');
        }

        setModel(null);
      } finally {
        if (requestIdRef.current == requestId) {
          setIsLoading(false);
        }
      }
    };

    loadCarModel();

    return () => {
      // invalidate requests
      requestIdRef.current++;
    };
  }, [carId, reloadIndex]);

  return { model, car, isLoading, error, reload };
};
