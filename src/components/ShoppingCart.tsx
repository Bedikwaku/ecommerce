"use client";
import { useCart } from "@src/app/providers";
import { Product } from "@src/models/product";
import { CartProduct } from "@src/models/shoppingCart";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const ShoppingCart = () => {
  const cart = useCart();
  const { data: session } = useSession();
  useEffect(() => {
    if (session && session.user) {
      const fetchCart = async () => {
        const res = await fetch("/api/shoppingCart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const cart = await res.json();
        console.log("Cart is: ", cart);
        return cart;
      };
      cart.clear();
      fetchCart().then((cartItems) => {
        cartItems.forEach((cartProduct: CartProduct) => {
          console.log("Restoring to cart: ", cartProduct);
          cart.addToCart(cartProduct, cartProduct.quantity);
        });
      });
    }
  }, [session]);

  console.log(cart.cart);
  return (
    <div>
      <h2>Shopping Cart</h2>
      <ul>
        {cart.cart.map((cartProduct) => (
          <li key={cartProduct.product.id}>
            <h3>{cartProduct.product.name}</h3>
            <p>R{cartProduct.product.price}</p>
            <p>qty: {cartProduct.quantity}</p>
          </li>
        ))}
      </ul>
      <CheckoutButton />
    </div>
  );
};

export const AddToCartButton = ({ product }: { product: CartProduct }) => {
  const cart = useCart();

  const onClick = async () => {
    cart.addToCart(product);
    const res = await fetch("/api/shoppingCart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: product.product.id }),
    });
  };
  return (
    <button
      onClick={() => onClick()}
      className="bg-green-600 rounded-full h-8 w-8 text-white text-lg"
    >
      +
    </button>
  );
};

export const RemoveFromCartButton = ({ productId }: { productId: string }) => {
  const cart = useCart();
  return (
    <button
      onClick={() => cart.removeFromCart(productId)}
      className="bg-red-600 rounded-full h-8 w-8 text-white text-lg"
    >
      -
    </button>
  );
};

export const CheckoutButton = () => {
  const cart = useCart();
  const validateItems = async () => {
    const validPromises = cart.cart.map(async (cartProduct) => {
      const res = await fetch(`/api/products/${cartProduct.product.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const product: Product = await res.json();
      return product.inventory >= cartProduct.quantity;
    });
    const valid = await Promise.all(validPromises);
    if (valid.every((item) => item)) {
      cart.checkout();
    } else {
      alert("Some items are not available in the desired quantity");
    }
  };
  return (
    <button
      onClick={validateItems}
      className="bg-blue-600 rounded-md h-8 w-24 text-white text-lg"
    >
      Checkout
    </button>
  );
};
