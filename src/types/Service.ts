export type UploadedImage = { url: string; public_id: string };

export type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  type: "at_home" | "at_store";
  estimated_time: string;
  status: "active" | "inactive" | "hidden";
  created_at?: string;
  updated_at?: string;
  category: {
    _id: string;
    name: string;
    description: string;
    status: "active" | "inactive";
  };
  start_date?: Date;
  end_date?: Date;
  rating?: number;
  discount?: number;
  images?: UploadedImage[];
}

export interface ServiceApi {
  _id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  type: "at_home" | "at_store";
  estimated_time: string;
  status: "active" | "inactive" | "hidden";
  created_at?: string;
  updated_at?: string;
  category: {
    _id: string;
    name: string;
    description: string;
    status: "active" | "inactive";
  };
  start_date?: Date;
  end_date?: Date;
  avg_rating?: number;
  sale_off?: number;
  images?: UploadedImage[];
}