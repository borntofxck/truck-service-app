"use client";

import { useState } from "react";

export function AdminLogoutButton() {
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);
    await fetch("/api/admin/logout", {
      method: "POST",
    });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isPending}
      className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-800 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Выходим..." : "Выйти"}
    </button>
  );
}
