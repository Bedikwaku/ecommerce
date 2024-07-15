import Image from "next/image";
import LoginButton from "@src/components/LoginButton";
import { ProductService } from "@src/lib/productService";
import { ProductCard } from "@src/components/ProductCard";
import { ShoppingCart } from "@src/components/ShoppingCart";

export default async function Home() {
  const products = await ProductService.getProducts();
  console.log("This is for debugging", process.env.NEXTAUTH_SECRET);
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4">
      <LoginButton />
      <div className="grid grid-cols-3 gap-4 container">
        <div id="available-products" className="col-span-2 flex flew-row gap-4">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        <div id="cart" className="col-span-1">
          <ShoppingCart />
        </div>
      </div>
    </main>
  );
}
