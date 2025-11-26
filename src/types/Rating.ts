export type Rating = {
    _id: string;
    product_id?: string;
    service_id?: string;
    name: string;
    score: number;
    comment: string;
    created_at: string;
    updated_at: string;
}

export interface RatingApi {
    ratings: never[];
    _id: string;
    product_id?: string;
    service_id?: string;
    name: string;
    score: number;
    comment: string;
    created_at: string;
    updated_at: string;
}