"use client";
import { CartProduct } from "@src/models/shoppingCart";
import { SessionProvider } from "next-auth/react";
import { createContext, ReactNode, useContext, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}

interface Product {
  id: number;
  name: string;
  price: string;
}

interface CartContextProps {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  checkout: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartProduct[]>([]);

  const addToCart = (cartProduct: CartProduct) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex(
        (item) => item.product.id === cartProduct.product.id
      );
      if (existingProductIndex !== -1) {
        // Copy the existing cart and update the quantity of the existing product
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: updatedCart[existingProductIndex].quantity + 1,
        };
        return updatedCart;
      } else {
        // Add the new product to the cart
        return [...prevCart, { ...cartProduct, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((cartProduct) => cartProduct.product.id !== productId)
    );
    console.log(cart);
  };

  const checkout = () => {
    console.log("Checkout successful");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
