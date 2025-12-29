import api from './api';

export interface PaintOption {
  id: string;
  name: string;
  color: string;
  finish: 'matte' | 'glossy' | 'metallic' | 'pearl';
  price: number;
  category: string;
  availableZones: string[];
}

export interface WheelDesignOption {
  id: string;
  name: string;
  modelUrl: string;
  previewUrl: string;
  price: number;
  compatibleSizes: number[];
  specs: {
    offset: string;
    boltPattern: string;
    weight: string;
  };
}

export interface BodyKitOption {
  id: string;
  name: string;
  previewUrl: string;
  price: number;
  compatibleCars: string[];
  pieces: BodyKitPieceOption[];
}

export interface BodyKitPieceOption {
  id: string;
  name: string;
  type: 'front_bumper' | 'rear_bumper' | 'side_skirts' | 'splitter' | 'diffuser';
  modelUrl: string;
  price: number;
}

export interface SpoilerOption {
  id: string;
  name: string;
  modelUrl: string;
  previewUrl: string;
  price: number;
  materialOptions: string[];
  positions: {
    id: string;
    name: string;
    offset: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
}

export interface DecalOption {
  id: string;
  name: string;
  type: 'stripe' | 'graphic' | 'number' | 'logo' | 'custom';
  previewUrl: string;
  price: number;
  defaultColor: string;
  svgPath?: string;
  width: number;
  height: number;
  availablePlacements: string[];
}

export interface CustomizationOptions {
  paints: PaintOption[];
  wheels: WheelDesignOption[];
  bodyKits: BodyKitOption[];
  spoilers: SpoilerOption[];
  decals: DecalOption[];
}

export interface SavedConfiguration {
  id: string;
  carId: string;
  paint: {
    color: string;
    finish: string;
    zones: Record<string, boolean>;
  };
  wheels: {
    designId: string;
    size: number;
    finish: string;
    tire: string;
  };
  bodyKit: {
    kitId: string | null;
    pieces: Record<string, boolean>;
  };
  spoiler: {
    designId: string | null;
    material: string;
    position: string;
    angle: number;
  };
  decals: Array<{
    id: string;
    designId: string;
    placement: string;
    color: string;
    opacity: number;
    scale: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
  }>;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const customizationApi = {
  async getOptions(carId: string): Promise<CustomizationOptions> {
    const response = await api.get<ApiResponse<CustomizationOptions>>(
      `/cars/${carId}/customizations`
    );
    return response.data.data;
  },

  async getPaintOptions(carId: string): Promise<PaintOption[]> {
    const response = await api.get<ApiResponse<PaintOption[]>>(
      `/cars/${carId}/customizations/paints`
    );
    return response.data.data;
  },

  async getWheelOptions(carId: string): Promise<WheelDesignOption[]> {
    const response = await api.get<ApiResponse<WheelDesignOption[]>>(
      `/cars/${carId}/customizations/wheels`
    );
    return response.data.data;
  },

  async getBodyKitOptions(carId: string): Promise<BodyKitOption[]> {
    const response = await api.get<ApiResponse<BodyKitOption[]>>(
      `/cars/${carId}/customizations/body-kits`
    );
    return response.data.data;
  },

  async getSpoilerOptions(carId: string): Promise<SpoilerOption[]> {
    const response = await api.get<ApiResponse<SpoilerOption[]>>(
      `/cars/${carId}/customizations/spoilers`
    );
    return response.data.data;
  },

  async getDecalOptions(carId: string): Promise<DecalOption[]> {
    const response = await api.get<ApiResponse<DecalOption[]>>(
      `/cars/${carId}/customizations/decals`
    );
    return response.data.data;
  },

  async saveConfiguration(config: Partial<SavedConfiguration>): Promise<SavedConfiguration> {
    const response = await api.post<ApiResponse<SavedConfiguration>>(
      '/configurations',
      config
    );
    return response.data.data;
  },

  async getConfiguration(id: string): Promise<SavedConfiguration> {
    const response = await api.get<ApiResponse<SavedConfiguration>>(
      `/configurations/${id}`
    );
    return response.data.data;
  },

  async getUserConfigurations(): Promise<SavedConfiguration[]> {
    const response = await api.get<ApiResponse<SavedConfiguration[]>>(
      '/configurations'
    );
    return response.data.data;
  },

  async updateConfiguration(id: string, config: Partial<SavedConfiguration>): Promise<SavedConfiguration> {
    const response = await api.put<ApiResponse<SavedConfiguration>>(
      `/configurations/${id}`,
      config
    );
    return response.data.data;
  },

  async deleteConfiguration(id: string): Promise<void> {
    await api.delete(`/configurations/${id}`);
  },

  async getCompatibility(
    carId: string,
    customizationType: string,
    optionId: string
  ): Promise<{ compatible: boolean; reason?: string }> {
    const response = await api.get<ApiResponse<{ compatible: boolean; reason?: string }>>(
      `/cars/${carId}/customizations/compatibility`,
      { params: { type: customizationType, optionId } }
    );
    return response.data.data;
  },
};

export default customizationApi;
