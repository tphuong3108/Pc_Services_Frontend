/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import { Service, ServiceApi, UploadedImage } from "@/types/Service";
import { mapService } from "@/lib/mappers";

export const serviceService = {
  getAll: async (limit = 10, page = 1): Promise<{ services: Service[]; total: number; totalPages: number }> => {
    try {
      const res = await api.get(`/services?limit=${limit}&page=${page}`);
      const rawServices = res.data.services as ServiceApi[];
      return {
        services: rawServices.map((s) => mapService(s)),
        total: res.data.total,
        totalPages: res.data.totalPages
      };
    } catch (error) {
      console.error("Error in getAll:", error);
      return {
        services: [],
        total: 0,
        totalPages: 1
      };
    }
  },
   //excel
  exportServicesToExcel: async (): Promise<Blob> => {
    try {
      const res = await api.get('/services/export', {
        responseType: 'blob', 
      });
      return res.data; 
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Service> => {
    try {
      const serviceId = typeof id === "object" && "_id" in id ? (id as any)._id : id;
      const res = await api.get(`/services/${serviceId}`);
      return mapService(res.data.service);
    } catch (error) {
      console.error("Error in getById:", error);
      throw error;
    }
  },

  getBySlug: async (slug: string): Promise<Service> => {
    try {
      const res = await api.get(`/services/slug/${slug}`);
      return mapService(res.data.service);
    } catch (error) {
      console.error("Error in getBySlug:", error);
      throw error;
    }
  },

  create: async (payload: FormData): Promise<Service> => {
    try {
      const res = await api.post("/services", payload);
      return mapService(res.data.service);
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  },

  update: async (id: string, payload: FormData): Promise<Service> => {
    try {
      const res = await api.put(`/services/${id}`, payload);
      return mapService(res.data.service);
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  },


  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/services/${id}`);
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },

  getFeatured: async (limit: number = 5): Promise<Service[]> => {
    try {
      const res = await api.get(`/services/featured?limit=${limit}`);
      const services = res.data.services as ServiceApi[];
      // Nếu đã đủ số lượng → trả về ngay
      if (services.length >= limit) {
        return services.map((s) => mapService(s));
      }

      const remaining = limit - services.length;

      // Lấy thêm dịch vụ từ all nếu cần
      if (remaining > 0) {
        const allServicesRes = await api.get(`/services?limit=${remaining * 2}&page=1`);
        const allServices = allServicesRes.data.services as ServiceApi[];

        // 🔥 Lọc ra những service chưa xuất hiện trong danh sách featured
        const featuredIds = new Set(services.map((s) => s._id));
        const uniqueExtraServices = allServices.filter((s) => !featuredIds.has(s._id));

        const combinedServices = [...services, ...uniqueExtraServices].slice(0, limit);
        return combinedServices.map((s) => mapService(s));
      }

      return services.map((s) => mapService(s));
    } catch (error) {
      console.error("Error in getFeatured:", error);
      return [];
    }
  },


  countViewRedis: async (id: string): Promise<void> => {
    try {
      await api.post(`/services/${id}/views`);
    } catch (error) {
      console.error("Error in countViewRedis:", error);
      throw error;
    }
  },
};