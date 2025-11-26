import api from "@/lib/api";
import { Items, Request, RequestApi } from "@/types/Request";
import { mapRequest } from "@/lib/mappers";
import { get } from "http";

export const requestService = {
    createRepair: async (data: Partial<RequestApi>): Promise<Request> => {
        try {
            const formData = new FormData();
            formData.append("service_id", data.service_id || "");
            formData.append("name", data.name || "");
            formData.append("email", data.email || "");
            formData.append("phone", data.phone || "");
            formData.append("address", data.address || "");
            formData.append("problem_description", data.problem_description || "");
            formData.append("repair_type", data.repair_type || "at_store");
            formData.append("estimated_time", data.estimated_time || "1 ngày");
            formData.append("status", data.status || "new");
            if (data.images && Array.isArray(data.images)) {
                if (data.images.length > 0 && data.images[0] instanceof File) {
                    (data.images as File[]).forEach((file) => {
                        formData.append("images", file);
                    });
                }
            }
            const res = await api.post("/requests/repairs", formData);
            return mapRequest(res.data.request);
        } catch (error) {
            throw error;
        }
    },
    createOrder: async (data: Partial<RequestApi>): Promise<Request> => {
        try {
            console.log("Creating order with data:", data);
            const res = await api.post("/requests/orders", data);
            return mapRequest(res.data.request);
        } catch (error) {
            throw error;
        }
    },

    getAllRepairs: async (hidden: boolean = false): Promise<Request[]> => {
        try {
            const res = await api.get("/requests/repairs");
            const repairs = res.data.requests;
            if (!hidden) {
                return repairs.filter((r: RequestApi) => !r.hidden).map((reqData: RequestApi) => mapRequest(reqData));
            }
            return repairs.map((reqData: RequestApi) => mapRequest(reqData));
        } catch (error) {
            throw error;
        }
    },
    getAllOrders: async (hidden: boolean = false): Promise<Request[]> => {
        try {
            const res = await api.get("/requests/orders");
            const orders = res.data.requests;
            if (!hidden) {
                return orders.filter((r: RequestApi) => !r.hidden).map((reqData: RequestApi) => mapRequest(reqData));
            }
            return orders.map((reqData: RequestApi) => mapRequest(reqData));
        } catch (error) {
            throw error;
        }
    },

    updateOrder: async (id: string, data: Partial<Request>): Promise<Request> => {
        try {
            const res = await api.put(`/requests/orders/${id}`, data);
            return mapRequest(res.data);
        } catch (error) {
            throw error;
        }
    },
    updateRepair: async (id: string, data: Partial<Request>): Promise<Request> => {
        try {
            const res = await api.put(`/requests/repairs/${id}`, data);
            return mapRequest(res.data);
        } catch (error) {
            throw error;
        }
    },

    getRepairById: async (id: string): Promise<Request> => {
        try {
            const res = await api.get(`/requests/repairs/${id}`);
            return mapRequest(res.data.request);
        } catch (error) {
            throw error;
        }
    },
    getOrderById: async (id: string): Promise<Request> => {
        try {
            const res = await api.get(`/requests/orders/${id}`);
            return mapRequest(res.data.request);
        } catch (error) {
            throw error;
        }
    },

    hideRepair: async (id: string): Promise<void> => {
        try {
            await api.patch(`/requests/repairs/${id}`, { hidden: true });
        } catch (error) {
            throw error;
        }
    },
    hideOrder: async (id: string): Promise<void> => {
        try {
            await api.patch(`/requests/orders/${id}`, { hidden: true });
        } catch (error) {
            throw error;
        }
    },

    // hide: async (id: string, data: Partial<Request>): Promise<void> => {
    //     const type = findType(data as Request);
    //     const endpoint = type === "repair" ? `/requests/repairs/${id}` : type === "order" ? `/requests/orders/${id}` : `/requests/${id}`;
    //     await api.patch(endpoint, { hidden: true });
    // },

    deleteRepair: async (id: string): Promise<void> => {
        try {
            await api.delete(`/requests/repairs/${id}`);
        } catch (error) {
            throw error;
        }
    },
};