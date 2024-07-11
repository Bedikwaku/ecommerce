import { ProductService } from "@src/lib/productService";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, price, quantity, description } = await req.json();
  try {
    const productId = await ProductService.createProduct(
      name,
      description,
      price,
      quantity
    );
    return new NextResponse(JSON.stringify({ id: productId }), { status: 201 });
  } catch (error) {
    console.error("Failed to create product", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create product" }),
      { status: 500 }
    );
  }
}
