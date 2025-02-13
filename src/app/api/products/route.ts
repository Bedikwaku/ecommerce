import { ProductService } from "@src/lib/productService";
import { Product } from "@src/models/product";
import { NextRequest, NextResponse } from "next/server";
import { cache } from "./ProductCache";

export async function POST(req: NextRequest) {
  const { name, price, quantity, description } = await req.json();
  try {
    const productId = await ProductService.createProduct(
      name,
      description,
      price,
      quantity
    );
    cache.incrementVersion();
    return new NextResponse(JSON.stringify({ id: productId }), { status: 201 });
  } catch (error) {
    console.error("Failed to create product", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create product" }),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || undefined;
  console.log("Query:", query);
  try {
    // Fetch the current version. In a real app, this might come from Redis or another store.
    const currentVersion = cache.getVersion();
    const products: Product[] = await ProductService.getProducts(query);
    const response = new NextResponse(JSON.stringify(products), {
      status: 200,
    });
    // Include the version in the Cache-Control header or as a custom header
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600"
    );
    response.headers.set("X-Cache-Version", currentVersion.toString());
    return response;
  } catch (error) {
    console.error("Failed to get products", error);
    return new NextResponse(JSON.stringify({ error: "Product not found" }), {
      status: 404,
    });
  }
}
