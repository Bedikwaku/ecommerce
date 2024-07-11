"use client";

export const AddProductForm = () => {
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(event);
    const form = event.currentTarget as HTMLFormElement;
    const name = form.elements.namedItem("name") as HTMLInputElement;
    const price = form.elements.namedItem("price") as HTMLInputElement;
    const quantity = form.elements.namedItem("quantity") as HTMLInputElement;
    const description = form.elements.namedItem(
      "description"
    ) as HTMLInputElement;
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
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center justify-center text-black"
    >
      <input
        id="name"
        type="text"
        placeholder="Item Name"
        className="p-2 m-2"
      />
      <input
        id="price"
        type="number"
        placeholder="Price"
        className="p-2 m-2"
        max={99999}
      />
      <input
        id="quantity"
        type="number"
        placeholder="Quantity"
        className="p-2 m-2"
      />
      <input
        id="description"
        type="text"
        placeholder="Description"
        className="p-2 m-2"
      />
      <button type="submit" className="p-2 m-2 bg-blue-500 text-white">
        Create Item
      </button>
    </form>
  );
};
