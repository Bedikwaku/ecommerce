import { ProductService } from "@src/lib/productService";
import { ShoppingCartService } from "@src/lib/shoppingCartService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { CartProduct } from "@src/models/shoppingCart";
import { authOptions } from "../auth/[...nextauth]/utils";

export async function POST(req: NextRequest) {
  const { productId, quantity } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    if (quantity === 0) {
      return new NextResponse(JSON.stringify({ error: "Invalid quantity" }), {
        status: 400,
      });
    }
    if (quantity > 0) {
      await ShoppingCartService.addItem(
        session.user!.email!,
        productId,
        quantity
      );
      return new NextResponse(JSON.stringify({ id: productId }), {
        status: 201,
      });
    } else {
      await ShoppingCartService.removeItem(
        session.user!.email!,
        productId,
        quantity * -1
      );
      return new NextResponse(JSON.stringify({ id: productId }), {
        status: 200,
      });
    }
  } catch (error) {
    console.error("Failed to add product to cart", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to add product to cart" }),
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
    console.log(cartProducts);
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
