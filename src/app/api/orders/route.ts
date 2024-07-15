import { ProductService } from "@src/lib/productService";
import { ShoppingCartService } from "@src/lib/shoppingCartService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { CartProduct } from "@src/models/cartProduct";
import { authOptions } from "../auth/[...nextauth]/utils";

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
        JSON.stringify({ error: "Failed to place order", limitedProducts }),
        { status: 500 }
      );
    }
    // Place order
  } catch (error) {
    console.error("Failed to place order", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to place order" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    const cartItems = await ShoppingCartService.getCart(session.user!.email!);
    const cartProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ProductService.getProduct(item.productId);
        return { product, quantity: item.quantity } as CartProduct;
      })
    );
    return new NextResponse(JSON.stringify(cartProducts), {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to get cart", error);
    return new NextResponse(JSON.stringify({ error: "Failed to get cart" }), {
      status: 500,
    });
  }
}
