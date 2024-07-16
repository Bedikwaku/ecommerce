"use client";
import { useCart } from "@src/app/providers";
import { Product } from "@src/models/product";
import { CartProduct } from "@src/models/cartProduct";
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
    cart.addToCart(product, 1);
    await fetch("/api/shoppingCart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: product.product.id, quantity: 1 }),
    });
  };
  return (
    <button
      onClick={onClick}
      className="bg-green-600 rounded-full h-8 w-8 text-white text-lg"
    >
      +
    </button>
  );
};

export const RemoveFromCartButton = ({ productId }: { productId: string }) => {
  const cart = useCart();
  const onClick = async () => {
    cart.removeFromCart(productId);
    await fetch("/api/shoppingCart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity: -1 }),
    });
  };
  return (
    <button
      onClick={onClick}
      className="bg-red-600 rounded-full h-8 w-8 text-white text-lg"
    >
      -
    </button>
  );
};

export const CheckoutButton = () => {
  const cart = useCart();
  const checkout = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order: cart.cart }),
    });
    if (res.ok) {
      alert("Checkout successful");
      cart.clear();
    } else {
      const { limitedProducts } = await res.json();
      alert(`Checkout failed. Understocked products: ${limitedProducts}`);
    }
  };
  return (
    <button
      onClick={checkout}
      className="bg-blue-600 rounded-md h-8 w-24 text-white text-lg"
    >
      Checkout
    </button>
  );
};
