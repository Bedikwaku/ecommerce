import { CartProduct, ShoppingCart } from "@src/models/shoppingCart";
import { Product } from "@src/models/product";
import { ProductService } from "./productService";

const addItem = (
  cart: ShoppingCart,
  product: Product,
  quantity: number
): void => {
  const existingItem = cart.items.find(
    (item) => item.product.id === product.id
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
  }
};

const removeItem = (cart: ShoppingCart, productId: string): void => {
  cart.items = cart.items.filter((item) => item.product.id !== productId);
};

const checkout = async (cart: CartProduct[]): Promise<void> => {
  // Validate stock availability for each item in the cart
  for (const item of cart) {
    const product = await ProductService.getProduct(item.product.id);
    if (!product.isAvailable(item.quantity)) {
      throw new Error(
        `Product ${product.name} is not available in the desired quantity`
      );
    }
  }

  // Here, you would typically proceed with creating an order record in the database
  // and deducting the quantities from the inventory, but those steps are omitted for brevity

  console.log("Checkout successful");
};

export const ShoppingCartService = {
  addItem,
  removeItem,
  checkout,
};
