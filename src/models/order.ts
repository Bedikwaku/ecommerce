import { CartProduct } from "./cartProduct";

export interface Order {
  id: string;
  user: string;
  products: CartProduct[];
  Total: number;
  createdAt: string;
}
