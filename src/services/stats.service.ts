import api from "@/lib/api";
import { Stats, StatsApi } from "@/types/Stats";
import { statsMapper } from "@/lib/mappers";
import { requestService } from "./request.service";
import { serviceService } from "./service.service";

export const statsService = {
    async getAllStats(): Promise<Stats[]> {
        try {
            const response = await api.get("/stats");
            return response.data.stats.map((s: StatsApi) => statsMapper(s));
        } catch (error) {
            console.error("Error fetching all stats:", error);
            throw error;
        }
    },

    async getStatsByDate(date: string): Promise<Stats> {
        try {
            const response = await api.get(`/stats/${date}`);
            return statsMapper(response.data.stats);
        } catch (error) {
            console.error(`Error fetching stats for date ${date}:`, error);
            throw error;
        }
    },

    async getCurrentStats(): Promise< Partial<Stats> & { completed_orders?: number, completed_repairs?: number } > {
        try {
            const response = await api.get("/stats/current");
            return response.data.stats;
        } catch (error) {
            console.error("Error fetching current stats:", error);
            throw error;
        }
    },

    async getStatsByMonth(month: number, year: number): Promise<Stats[]> {
        try {
            const response = await api.get(`/stats/month/${month}/${year}`);
            return response.data.stats.map((s: StatsApi) => statsMapper(s));
        } catch (error) {
            console.error(`Error fetching stats for month ${month}/${year}:`, error);
            throw error;
        }
    },

    async updateStats(data: Stats, date?: string): Promise<Stats> {
        const today = date || new Date().toISOString().split("T")[0];
        try {
            const response = await api.put(`/stats?date=${today}`, data);
            return statsMapper(response.data.stats);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = error as any || {};
            if (message.response && message.response.status === 404) {
                return this.createStats(data, today);
            }
            console.error("Lỗi cập nhật thống kê:", error);
            throw error;
        }
    },

    async createStats(data: Stats, date: string): Promise<Stats> {
        try {
            const response = await api.post(`/stats?date=${date}`, {
                ...data, visits: 0
            });
            return statsMapper(response.data.stats);
        } catch (error) {
            console.error(`Error creating stats for date ${date}:`, error);
            throw error;
        }
    },

    async countVisits(date?: string): Promise<number> {
        const today = date || new Date().toISOString().split("T")[0];
        try {
            const response = await api.patch(`/stats/visit?date=${today}`);
            return response.data.stats.visits;
        } catch (error) {
            console.error(`Error counting visits for date ${today}:`, error);
            throw error;
        }
    },

    async calculateStatsMonth(): Promise<Stats> {
        try {
            const currentMonth = (new Date().getMonth() + 1);
            const currentYear = new Date().getFullYear();
            
            const data = await statsService.getStatsByMonth(currentMonth, currentYear);
            console.log("Stats for current month:", data);

            let total_profit = 0;
            let total_orders = 0;
            let total_repairs = 0;
            let total_products = 0;
            let visits = 0;

            for (const stat of data) {
                total_profit += stat.total_profit || 0;
                total_orders += stat.total_orders || 0;
                total_repairs += stat.total_repairs || 0;
                total_products += stat.total_products || 0;
                visits += stat.visits || 0;
            }

            const payload = {
                total_profit,
                total_orders,
                total_repairs,
                total_products,
                visits
            };

            return payload;
        } catch (error) {
            console.error("Error calculating month profit:", error);
            throw error;
        }
    },

    async calculateTodayProfit(dateString?: string): Promise<number> {
        const today = dateString || new Date().toISOString().split("T")[0];
        try {
            const [orders, repairs] = await Promise.all([
                requestService.getAllOrders(),
                requestService.getAllRepairs(),
            ]);

            const filteredOrders = orders.filter(
                item => item.status === "completed" && item.updatedAt?.startsWith(today)
            );
            const filteredRepairs = repairs.filter(
                item => item.status === "completed" && item.updatedAt?.startsWith(today)
            );

            let total = 0;

            for (const order of filteredOrders) {
                for (const item of order.items || []) {
                    const price =
                        typeof item.price === "number"
                            ? item.price
                            : typeof item.product_id === "object"
                                ? (item.product_id as { price: number }).price
                                : 0;
                    const qty = item.quantity || 1;
                    total += price * qty;
                }
            }

            for (const repair of filteredRepairs) {
                try {
                    const service = await serviceService.getById(repair.service_id as string);
                    total += service.price || 0;
                } catch (error) {
                    console.error(`Error fetching service for repair ${repair.service_id}:`, error);
                }
            }

            return total;
        } catch (error) {
            console.error("Error calculating today profit:", error);
            throw error;
        }
    }
};
