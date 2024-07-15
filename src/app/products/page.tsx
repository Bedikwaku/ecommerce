import LoginButton from "@src/components/LoginButton";
import { ProductForm } from "@src/components/ProductForm";
import { ProductService } from "@src/lib/productService";

export default async function Products() {
  const products = await ProductService.getProducts();

  return (
    <main className="flex flex-col gap-20 items-center justify-between p-24">
      <LoginButton />
      <ProductForm products={products} />
    </main>
  );
}
