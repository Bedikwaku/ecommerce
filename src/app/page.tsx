import Image from "next/image";
import LoginButton from "@src/components/LoginButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <LoginButton />
      <form className="flex flex-col items-center justify-center">
        <input type="text" placeholder="Item Name" className="p-2 m-2" />
        <input type="number" placeholder="Price" className="p-2 m-2" />
        <input type="number" placeholder="Quantity" className="p-2 m-2" />
        <input type="text" placeholder="Description" className="p-2 m-2" />
        <button type="submit" className="p-2 m-2 bg-blue-500 text-white">
          Create Item
        </button>
      </form>
    </main>
  );
}
