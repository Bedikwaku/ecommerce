"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export const SearchBar = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const router = useRouter();
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    params.set("q", query);
    router.push(`?q=${query}`);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-black rounded-sm flex flex-row"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="bg-blue-800 text-white">
        Search
      </button>
    </form>
  );
};
