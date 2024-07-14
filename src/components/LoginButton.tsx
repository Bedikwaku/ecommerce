"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  if (session && session.user) {
    return (
      <div>
        Signed in as <strong>{session.user.email}</strong> <br />
        <button
          className="bg-green-600 hover:bg-green-800 px-2 py-1 rounded-md text-white"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div>
      Not signed in <br />
      <button
        className="bg-green-600 hover:bg-green-800 px-2 py-1 rounded-md text-white"
        onClick={() => signIn()}
      >
        Sign in
      </button>
    </div>
  );
}
