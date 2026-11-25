export type MenuCategory = "Paket Nasi" | "Lauk Pilihan" | "Sayuran" | "Minuman";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  allergens?: string[];
  createdAt?: string;
}

export interface CreateMenuDTO {
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export type UpdateMenuDTO = Partial<CreateMenuDTO>;
