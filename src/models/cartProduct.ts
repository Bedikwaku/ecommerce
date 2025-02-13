import { Product } from "./product";

export interface CartProduct {
  product: Product;
  quantity: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}
