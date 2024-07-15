import { ProductService } from "@src/lib/productService";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await ProductService.getProduct(params.id);
    return new NextResponse(JSON.stringify(product), { status: 200 });
  } catch (error) {
    console.error("Failed to get product", error);
    return new NextResponse(JSON.stringify({ error: "Product not found" }), {
      status: 404,
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, price, quantity, description } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    await ProductService.updateProduct(
      params.id,
      name,
      description,
      price,
      quantity
    );
    return new NextResponse(JSON.stringify({ id: params.id }), { status: 200 });
  } catch (error) {
    console.error("Failed to update product", error);
    return new NextResponse(
      JSON.stringify({ error: "Product could not be updated" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // delete product
  const { id } = params;
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
