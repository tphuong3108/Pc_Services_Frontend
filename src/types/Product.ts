export type UploadedImage = {
  url: string;
  public_id: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  tags: string[];
  description: string;
  rating?: number;
  price: number;
  quantity: number;
  status: "available" | "out_of_stock" | "hidden";
  brand: string;
  panel?: string;
  size?: string;
  resolution?: string;
  model?: string;
  ports: string[];
  category_id: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  images: UploadedImage[];
  sale_off?: number;
  start_date?: Date;
  end_date?: Date;
  createdAt: string;
  updatedAt: string;
};

// Kiểu dữ liệu raw từ API (BE có thể snake_case)
export interface ProductApi {
  _id: string;
  name: string;
  slug: string;
  tags?: string[];
  avg_rating?: number;
  description?: string;
  price: number;
  quantity: number;
  status: "available" | "out_of_stock" | "hidden";
  brand: string;
  panel?: string;
  size?: string;
  resolution?: string;
  model?: string;
  ports?: string[];
  category_id: string;
  category?: { _id: string; name: string; slug: string };
  images: (File | UploadedImage)[];
  sale_off?: number;
  start_date?: string;
  end_date?: string;
  createdAt: string; // nếu BE trả camelCase
  updatedAt: string;
}
