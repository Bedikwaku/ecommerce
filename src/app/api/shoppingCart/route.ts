import { ProductService } from "@src/lib/productService";
import { ShoppingCartService } from "@src/lib/shoppingCartService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { CartProduct } from "@src/models/shoppingCart";

export async function POST(req: NextRequest) {
  const { productId } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    await ShoppingCartService.addItem(session.user!.email!, productId, 1);
    return new NextResponse(JSON.stringify({ id: productId }), { status: 201 });
  } catch (error) {
    console.error("Failed to create product", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create product" }),
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
