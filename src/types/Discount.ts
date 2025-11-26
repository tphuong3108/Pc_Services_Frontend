import { Product, ProductApi } from "./Product";
import { Service, ServiceApi } from "./Service";

export type Discount = {
    _id: string,
    product?: Product,
    service?: Service,
    product_category_id?: string,
    service_category_id?: string,
    type: string,
    sale_off: number,
    start_date: Date,
    end_date: Date
}


export interface DiscountApi {
    _id: string,
    product?: ProductApi,
    service?: ServiceApi,
    product_category_id?: string,
    service_category_id?: string,
    type: string,
    sale_off: number,
    start_date: Date,
    end_date: Date
}