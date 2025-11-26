import { Cart, CartItem } from "@/types/Cart";
import { productService } from "./product.service";

export const cartService = {
  // Lấy cart từ localStorage, có kiểm tra và fallback nếu lỗi
  getCart: async (): Promise<Cart> => {
    try {
      const res = localStorage.getItem("cart");
      if (res) {
        const parsed = JSON.parse(res);
        // Kiểm tra structure hợp lệ
        if (
          parsed &&
          Array.isArray(parsed.items) &&
          typeof parsed.totalPrice === "number"
        ) {
          return parsed;
        } else {
          console.warn("Cart format invalid:", parsed);
        }
      }
    } catch (err) {
      console.error("Error parsing cart from localStorage:", err);
    }

    // Nếu cart không hợp lệ hoặc không tồn tại → tạo cart rỗng
    const emptyCart: Cart = {
      _id: "",
      items: [],
      totalPrice: 0,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem("cart", JSON.stringify(emptyCart));
    return emptyCart;
  },

  // Lưu cart vào localStorage
  saveCart: async (cart: Cart): Promise<void> => {
    localStorage.setItem("cart", JSON.stringify(cart));
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId: string, quantity: number): Promise<Cart> => {
    try {
      let cart = await cartService.getCart();

      // Kiểm tra lại lần nữa
      if (!cart || !Array.isArray(cart.items)) {
      cart = { _id: "", items: [], totalPrice: 0, updated_at: "" };
      }

      const existingProduct = cart.items.find(
      (p) => p.product_id === productId
      );

      const product = await productService.getById(productId);

      if (existingProduct) {
      existingProduct.quantity += quantity;
      } else {
      cart.items.push({
        product_id: productId,
        name: product.name,
        quantity,
        price: product.price,
        image: product.images[0].url || "",
      });
      }

      cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
      );
      cart.updated_at = new Date().toISOString();

      await cartService.saveCart(cart);
      return cart;
    } catch (err) {
      console.error("Error adding to cart:", err);
      // fallback: return empty cart
      const emptyCart: Cart = {
      _id: "",
      items: [],
      totalPrice: 0,
      updated_at: new Date().toISOString(),
      };
      return emptyCart;
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (productId: string): Promise<Cart> => {
    try {
      let cart = await cartService.getCart();

      if (!cart || !Array.isArray(cart.items)) {
      cart = { _id: "", items: [], totalPrice: 0, updated_at: "" };
      }

      cart.items = cart.items.filter((p) => p.product_id !== productId);

      cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
      );
      cart.updated_at = new Date().toISOString();

      await cartService.saveCart(cart);
      return cart;
    } catch (err) {
      console.error("Error removing from cart:", err);
      const emptyCart: Cart = {
      _id: "",
      items: [],
      totalPrice: 0,
      updated_at: new Date().toISOString(),
      };
      return emptyCart;
    }
  },
};
