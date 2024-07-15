"use client";

import { Product } from "@src/models/product";
import { ChangeEvent, useEffect, useState } from "react";

interface FormProps {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
}

const AddProductForm = (props: FormProps) => {
  const [name, setName] = useState(props.name || "");
  const [price, setPrice] = useState(props.price || 0);
  const [quantity, setQuantity] = useState(props.quantity || 0);
  const [description, setDescription] = useState(props.description || "");

  useEffect(() => {
    setName(props.name || "");
    setPrice(props.price || 0);
    setQuantity(props.quantity || 0);
    setDescription(props.description || "");
  }, [props]);

  return (
    <div className="flex flex-col items-center justify-center text-black border-slate-400 border-4 rounded-lg p-4 m-4 ">
      <input id="id" type="hidden" value={props.id ?? "new"} />
      <input
        id="name"
        type="text"
        placeholder="Item Name"
        className="p-2 m-2"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        id="price"
        type="number"
        placeholder="Price"
        className="p-2 m-2"
        max={99999}
        value={price}
        onChange={(event) => setPrice(parseFloat(event.target.value))}
      />
      <input
        id="quantity"
        type="number"
        placeholder="Quantity"
        className="p-2 m-2"
        value={quantity}
        onChange={(event) => setQuantity(parseInt(event.target.value))}
      />
      <input
        id="description"
        type="text"
        placeholder="Description"
        className="p-2 m-2"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
    </div>
  );
};

export const ProductForm = ({ products }: { products: Product[] }) => {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const handleProductChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedProductId = event.target.value;
    const selectedProduct = products.find(
      (product) => product.id === selectedProductId
    );
    setActiveProduct(
      selectedProduct || {
        id: "new",
        name: "",
        price: 0,
        inventory: 0,
        description: "",
      }
    );
  };
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event);
    const form = event.currentTarget as HTMLFormElement;
    const id = activeProduct?.id;
    const name = form.elements.namedItem("name") as HTMLInputElement;
    const price = form.elements.namedItem("price") as HTMLInputElement;
    const quantity = form.elements.namedItem("quantity") as HTMLInputElement;
    const description = form.elements.namedItem(
      "description"
    ) as HTMLInputElement;
    console.log(activeProduct?.id);
    if (id && id != "new") {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.value,
          price: parseFloat(price.value),
          quantity: parseInt(quantity.value),
          description: description.value,
        }),
      });
      return;
    }

    await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: name.value,
        price: parseFloat(price.value),
        quantity: parseInt(quantity.value),
        description: description.value,
      }),
    });
    form.reset();
  };
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product?") === false)
      return;
    if (!activeProduct?.id) {
      alert("Please select a product to delete.");
      return;
    }
    const response = await fetch(`/api/products/${activeProduct.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      alert("Product deleted successfully.");
      products.splice(products.indexOf(activeProduct), 1);
    } else {
      alert("Failed to delete the product.");
    }
  };
  return (
    <form
      className="grid grid-cols-3 gap-4 container text-black bg-gray-600"
      onSubmit={onSubmit}
    >
      <select
        className="overflow-auto"
        size={products.length + 1}
        onChange={handleProductChange}
      >
        <option id="new" value="new">
          [New Product]
        </option>
        {products.map((product) => (
          <option
            label={product.name}
            id={product.id}
            key={product.id}
            value={product.id}
          />
        ))}
      </select>
      <div className="flex flex-col items-center">
        <AddProductForm
          name={activeProduct?.name}
          price={activeProduct?.price}
          description={activeProduct?.description}
          quantity={activeProduct?.inventory}
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-8">
        <button type="submit" className="p-2 m-2 bg-blue-500 text-white">
          Create/Update Item
        </button>
        <button
          type="button"
          className="p-2 m-2 border-red-500 border-2 bg-red-500 text-white"
          onClick={handleDelete}
        >
          Delete Product
        </button>
      </div>
    </form>
  );
};
