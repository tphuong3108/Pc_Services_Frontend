export type UploadedImage = { url: string; public_id: string };
export type Items = { name: string; 
                      product_id: {
                        _id: string;
                        name: string;
                        price: number;
                      }; 
                      quantity: number; 
                      price: number }[];

export type Request = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  problem_description?: string;
  items?: Items;
  note?: string;
  repair_type?: "at_home" | "at_store";
  estimated_time: string;
  status: "new" | "in_progress" | "completed" | "cancelled";
  service_id?: {
    _id: string;
    name: string;
    price: number;
  } | string;
  images?: UploadedImage[];
  createdAt: string;
  updatedAt: string;
  hidden?: boolean | false;
}

export interface RepairRequestPayload {
  service_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  problem_description: string;
  estimated_time: string;
  repair_type: "at_home" | "at_store";
  status: "new" | "in_progress" | "completed" | "cancelled";
  images?: UploadedImage[];
}

export interface RequestApi {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  problem_description?: string;
  items?: Items;
  note?: string;
  repair_type?: "at_home" | "at_store";
  estimated_time: string;
  status: "new" | "in_progress" | "completed" | "cancelled";
  service_id?: string;
  images?: (File | UploadedImage)[];
  createdAt: string;
  updatedAt: string;
  hidden?: boolean | false;
}