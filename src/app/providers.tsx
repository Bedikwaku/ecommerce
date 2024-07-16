"use client";
import { CartProduct } from "@src/models/cartProduct";
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
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: string, quantity?: number) => void;
  checkout: () => void;
  clear: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartProduct[]>([]);

  const addToCart = (cartProduct: CartProduct, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex(
        (item) => item.product.id === cartProduct.product.id
      );
      if (existingProductIndex !== -1) {
        // Copy the existing cart and update the quantity of the existing product
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: updatedCart[existingProductIndex].quantity + quantity,
        };
        return updatedCart;
      } else {
        // Add the new product to the cart
        return [...prevCart, { ...cartProduct, quantity: quantity }];
      }
    });
  };

  const removeFromCart = (productId: string, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex(
        (item) => item.product.id === productId
      );
      if (existingProductIndex !== -1) {
        // Copy the existing cart and update the quantity of the existing product
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: updatedCart[existingProductIndex].quantity - quantity,
        };
        if (updatedCart[existingProductIndex].quantity <= 0) {
          return updatedCart.filter(
            (cartProduct) => cartProduct.product.id !== productId
          );
        }
        return updatedCart;
      }
      return prevCart; // Add this line to return the previous cart if the condition is not met
    });
  };

  const checkout = () => {
    console.log("Checkout successful");
  };

  const clear = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, checkout, clear }}
    >
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
