import { ProductService } from "@src/lib/productService";
import { ShoppingCartService } from "@src/lib/shoppingCartService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { CartProduct } from "@src/models/cartProduct";
import { authOptions } from "../auth/[...nextauth]/utils";
import { OrderService } from "@src/lib/orderService";
import { cache } from "../products/ProductCache";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { order }: { order: CartProduct[] } = await req.json();
  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ error: "User must be logged in to checkout" }),
      {
        status: 401,
      }
    );
  }
  let orderId: string;
  try {
    // Validate that all products are in stock
    const limitedProducts: CartProduct[] = [];
    for (const item of order) {
      const product = await ProductService.getProduct(item.product.id);
      if (product.inventory < item.quantity) {
        const stockShortage = item.quantity - product.inventory;
        limitedProducts.push({ ...item, quantity: stockShortage });
      }
    }
    if (limitedProducts.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Failed to place order",
          limitedProducts: limitedProducts,
        }),
        { status: 500 }
      );
    }
    // Place order
    console.log("Placing order for user", session.user.email);
    orderId = await OrderService.createOrder(session.user.email!, order);
    console.log("Order placed successfully", orderId);
    // Clear shopping cart
    try {
      await ShoppingCartService.clearCart(session.user.email!);
    } catch (error) {
      console.error("Failed to clear shopping cart after order", error);
    }

    // Update product inventory
    try {
      order.forEach(async (item) => {
        await ProductService.updateProduct({
          id: item.product.id,
          inventory: item.product.inventory - item.quantity,
        });
      });
    } catch (error) {
      console.error(
        `Failed to update product inventory after order ${orderId}`,
        error
      );
    }
    const response = new NextResponse(JSON.stringify({ orderId }), {
      status: 200,
    });
    cache.incrementVersion();
    return response;
  } catch (error) {
    console.error("Failed to place order", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to place order" }),
      { status: 500 }
    );
  }
}
