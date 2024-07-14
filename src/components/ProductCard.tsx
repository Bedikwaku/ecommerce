import { Product } from "@src/models/product";
import { AddToCartButton, RemoveFromCartButton } from "./ShoppingCart";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div
      key={product.id}
      className="flex bg-slate-700 text-slate-300 flex-col items-start justify-center p-4 rounded h-52"
    >
      <h2>
        <strong>Title:</strong> {product.name}
      </h2>
      <p>
        <strong>Description:</strong> {product.description}
      </p>
      <p>
        <strong>Price:</strong> R{product.price}
      </p>
      <p>Inventory: {product.inventory}</p>
      <div className="flex gap-4 flex-row items-center justify-between w-full">
        <AddToCartButton product={{ product, quantity: 1 }} />
        <RemoveFromCartButton productId={product.id} />
      </div>
    </div>
  );
};
