export type Cart = {
    _id: string;
    items:  CartItem[];
    totalPrice: number;
    updated_at: string;
}

export type CartItem = {
  name: string;
  product_id: string;
  quantity: number;
  price: number;
  image?: string;
}