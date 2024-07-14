import { ProductService } from "@src/lib/productService";
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

export async function GET() {
  try {
    const product = await ProductService.getProducts();
    return new NextResponse(JSON.stringify(product), { status: 200 });
  } catch (error) {
    console.error("Failed to get products", error);
    return new NextResponse(JSON.stringify({ error: "Product not found" }), {
      status: 404,
    });
  }
}
