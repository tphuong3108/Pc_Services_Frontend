import api from "@/lib/api"
import { CategoryService } from "@/types/CategoryService"

export const categoryServiceService = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<CategoryService[]> => {
    try {
      const res = await api.get("/service-categories")
      return res.data.categories
    } catch (error) {
      console.error(error)
      return []
    }
  },

  // Lấy chi tiết
  getById: async (id: string): Promise<CategoryService | null> => {
    try {
      const res = await api.get(`/service-categories/${id}`)
      return res.data.category
    } catch (error) {
      console.error(error)
      return null
    }
  },

  // Lấy theo slug
  getBySlug: async (slug: string): Promise<CategoryService | null> => {
    try {
      const res = await api.get(`/service-categories/slug/${slug}`)
      return res.data.category
    } catch (error) {
      console.error(error)
      return null
    }
  },

  // Tạo mới
  create: async (payload: Partial<CategoryService>): Promise<CategoryService | null> => {
    try {
      const res = await api.post("/service-categories", payload)
      return res.data.category
    } catch (error) {
      console.error(error)
      return null
    }
  },

  // Cập nhật
  update: async (id: string, payload: Partial<CategoryService>): Promise<CategoryService | null> => {
    try {
      const res = await api.put(`/service-categories/${id}`, payload)
      return res.data.category
    } catch (error) {
      console.error(error)
      return null
    }
  },

  // Xóa
  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/service-categories/${id}`)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },
}
