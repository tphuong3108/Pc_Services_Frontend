/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api'
import { Discount } from '@/types/Discount'
import { DiscountApi } from '@/types/Discount'
import { mapDiscount } from '@/lib/mappers'

export const discountService = {
    getAllDiscounts: async (type: string, limit: number = 10, page: number = 1): Promise<Discount[]> => {
        try {
            const response = await api.get(`/discounts/${type}?limit=${limit}&page=${page}`)
            const data = response.data
            const discounts = data.discounts as DiscountApi[]
            return discounts.map(mapDiscount)
        } catch (error) {
            throw error
        }
    },

    getDiscountById: async (type: string, id: string): Promise<Discount | null> => {
        try {
            const response = await api.get(`/discounts/${type}/${id}`);
            const data = response.data;
            if (!data || !data.discount) {
                console.warn(`No discount data found for: ${type} with ID ${id}`);
                return null;
            }
            const discount = data.discount as DiscountApi;
            return mapDiscount(discount);
        } catch (error) {
            const anyError = error as any;
            if (anyError.response && anyError.response.status === 404) {
                console.warn(`Discount not found: ${type} with ID ${id}`);
                return null;
            }
            console.error(anyError);
            return null;
        }
    },

    createDiscount: async (data: any): Promise<Discount> => {
        try {
            const response = await api.post<DiscountApi>('/discounts', data);
            return mapDiscount(response.data);
        } catch (error) {
            // Optionally handle/log error here
            throw error;
        }
    },

    updateDiscount: async (type: string, id: string, data: Partial<Discount>): Promise<Discount | null> => {
        try {
            const response = await api.put(`/discounts/${type}/${id}`, data);
            return mapDiscount(response.data.discount);
        } catch (error) {
            // Optionally handle/log error here
            console.error(error);
            return null;
        }
    },

    deleteDiscount: async (id: string): Promise<boolean> => {
        try {
            await api.delete(`/discounts/${id}`);
            return true;
        } catch (error) {
            // Optionally handle/log error here
            console.error(error);
            return false;
        }
    },

    getDiscountforAll: async (type: string): Promise<Discount[]> => {
        try {
            const response = await api.get(`/discounts/${type}/all`)
            const data = response.data
            const discounts = data.discounts as DiscountApi[]
            return discounts.map(mapDiscount)
        } catch (error) {
            throw error
        }
    },

    updateDiscountforAll: async (type: string, data: Partial<Discount>): Promise<boolean> => {
        try {
            console.log('Updating discounts for all:', type)
            await api.put(`/discounts/${type}/all`, data)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    },
}
