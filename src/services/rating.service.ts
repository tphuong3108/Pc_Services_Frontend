/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import { Rating, RatingApi } from "@/types/Rating";
import { mapRating } from "@/lib/mappers";

export const ratingService = {
    getAll: async (): Promise<{ ratings: Rating[] }> => {
        try {
            const res = await api.get("/ratings");
            return {
                ratings: res.data.ratings.map((r: RatingApi) => mapRating(r)),
            };
        } catch (error) {
            console.error("Error fetching all ratings:", error);
            throw error;
        }
    },

    getByProductId: async (productId: string): Promise<{ ratings: Rating[] }> => {
        try {
            const res = await api.get(`/ratings/product/${productId}`);
            return {
                ratings: res.data.ratings.map((r: RatingApi) => mapRating(r)),
            };
        } catch (error) {
            console.error("Error fetching ratings by product ID:", error);
            throw error;
        }
    },

    getByServiceId: async (serviceId: string): Promise<{ ratings: Rating[] }> => {
        try {
            const res = await api.get(`/ratings/service/${serviceId}`);
            return {
                ratings: res.data.ratings.map((r: RatingApi) => mapRating(r)),
            };
        } catch (error) {
            console.error("Error fetching ratings by service ID:", error);
            throw error;
        }
    },

    getScoreByProductId: async (productId: string): Promise<number> => {
        console.log('Hit hard!')
        try {
            const res = await api.get(`/ratings/product/${productId}`);
            const ratings: ({ score: number } | null)[] = res.data.ratings;
            if (!ratings || ratings.length === 0) {
                return 0;
            }
            let total = 0;
            ratings.forEach((rating) => {
                if (rating && typeof rating.score === "number") {
                    total += rating.score;
                }
            });
            const average = total / ratings.length;
            return average;
        } catch (error) {
            console.error("Error fetching score by product ID:", error);
            throw error;
        }
    },
    
    create: async (data: any) => {
        try {
            const res = await api.post("/ratings", data);
            return res.data;
        } catch (error) {
            console.error("Error creating rating:", error);
            throw error;
        }
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/ratings/${id}`);
    },
};