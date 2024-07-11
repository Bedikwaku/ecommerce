import LoginButton from "@src/components/LoginButton";
import { ProductService } from "@src/lib/productService";
import { AddProductForm } from "@src/components/AddProductForm";

export default async function Products() {
  const products = await ProductService.getProducts();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col items-center justify-center"
        >
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>{product.price}</p>
          <p>{product.inventory}</p>
        </div>
      ))}
      <LoginButton />
      <AddProductForm />
    </main>
  );
}
