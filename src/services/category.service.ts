import api from "@/lib/api";
import { CategoryApi } from "@/types/Category";

interface GetAllResponse {
  status: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  categories: CategoryApi[];
}

export const categoryService = {
  // Lấy danh sách có phân trang
  getAll: async (
    limit: number = 10,
    page: number = 1
  ): Promise<GetAllResponse> => {
    try {
      const res = await api.get(`/categories?page=${page}&limit=${limit}`);
      return res.data as GetAllResponse;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết 1 category
  getById: async (id: string): Promise<CategoryApi> => {
    try {
      const res = await api.get<{ category: CategoryApi }>(`/categories/${id}`);
      return res.data.category;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết theo slug
  getBySlug: async (slug: string): Promise<CategoryApi> => {
    try {
      const escapeVietnamese = (str: string) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(" ", "-");

      const query = escapeVietnamese(decodeURIComponent(slug.toLowerCase().trim()));
      const res = await api.get<{ category: CategoryApi }>(`/categories/slug/${query}`);
      return res.data.category;
    } catch (error) {
      throw error;
    }
  },

  // Tạo mới category
  create: async (data: Pick<CategoryApi, "name" | "description">): Promise<CategoryApi> => {
    try {
      const res = await api.post<{ category: CategoryApi }>("/categories", data);
      return res.data.category;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật category
  update: async (
    id: string,
    data: Partial<Pick<CategoryApi, "name" | "description">>
  ): Promise<CategoryApi> => {
    try {
      const res = await api.put<{ category: CategoryApi }>(`/categories/${id}`, data);
      return res.data.category;
    } catch (error) {
      throw error;
    }
  },

  // Xoá category
  delete: async (id: string): Promise<{ status: string; message: string }> => {
    try {
      const res = await api.delete<{ status: string; message: string }>(`/categories/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
