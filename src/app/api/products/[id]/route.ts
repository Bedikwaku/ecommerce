import { ProductService } from "@src/lib/productService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { id } = await req.json();
  try {
    const product = await ProductService.getProduct(id as string);
    return new NextResponse(JSON.stringify(product), { status: 200 });
  } catch (error) {
    console.error("Failed to get product", error);
    return new NextResponse(JSON.stringify({ error: "Product not found" }), {
      status: 404,
    });
  }
}
export async function PUT(req: NextRequest) {
  const { id, name, description, price, inventory } = await req.json();

  try {
    await ProductService.updateProduct(
      id as string,
      name as string,
      description as string,
      parseFloat(price as string),
      parseInt(inventory as string)
    );
    return new NextResponse(JSON.stringify({ id: id }), { status: 200 });
  } catch (error) {
    console.error("Failed to update product", error);
    return new NextResponse(
      JSON.stringify({ error: "Product could not be updated" }),
      { status: 404 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // delete product
  const { id } = await req.json();
  try {
    await ProductService.deleteProduct(id as string);
    return new NextResponse(
      JSON.stringify(`Product ${id} deleted successfully`),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to delete product", error);
    return new NextResponse(
      JSON.stringify({ error: "Product could not be deleted" }),
      { status: 404 }
    );
  }
}
