// services/banner.service.ts
import api from "@/lib/api";
import { Banner, BannerApi } from "@/types/Banner";
import { mapBanner, mapLayoutToApi } from "@/lib/mappers";

export const bannerService = {
  getAll: async (limit = 10, page = 1): Promise<{ banners: Banner[] }> => {
    try {
      const res = await api.get(`/banners?limit=${limit}&page=${page}`);
      return {
        banners: res.data.banners.map((b: BannerApi) => mapBanner(b)),
      };
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<Banner> => {
    try {
      const res = await api.get(`/banners/${id}`);
      return mapBanner(res.data.banner);
    } catch (error) {
      throw error;
    }
  },

  create: async (data: FormData | Partial<Banner>): Promise<Banner> => {
    try {
      if (data instanceof FormData) {
        if (data.has("layout")) {
          const raw = data.get("layout");
          if (typeof raw === "string") {
            const mapped = mapLayoutToApi(raw as Banner["layout"]);
            if (mapped !== undefined) data.set("layout", String(mapped));
          }
        }
        const res = await api.post("/banners", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return mapBanner(res.data.banner);
      } else {
        const payload: Partial<BannerApi> = {
          ...data,
          layout: mapLayoutToApi(data.layout),
        };
        const res = await api.post("/banners", payload);
        return mapBanner(res.data.banner);
      }
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, data: FormData | Partial<Banner>): Promise<Banner> => {
    try {
      if (data instanceof FormData) {
        if (data.has("layout")) {
          const raw = data.get("layout");
          if (typeof raw === "string") {
            const mapped = mapLayoutToApi(raw as Banner["layout"]);
            if (mapped !== undefined) data.set("layout", String(mapped));
          }
        }
        const res = await api.put(`/banners/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return mapBanner(res.data.banner);
      } else {
        const payload: Partial<BannerApi> = {
          ...data,
          layout: mapLayoutToApi(data.layout),
        };
        const res = await api.put(`/banners/${id}`, payload);
        return mapBanner(res.data.banner);
      }
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/banners/${id}`);
    } catch (error) {
      throw error;
    }
  },
};
