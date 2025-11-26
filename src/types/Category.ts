export interface CategoryApi {
  _id: string;
  name: string;
  slug: string;
  tags?: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type Category = {
  _id: string;
  name: string;
  slug: string;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}
