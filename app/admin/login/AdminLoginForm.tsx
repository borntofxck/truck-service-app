"use client";

import { useState } from "react";

type Mode = "login" | "setup";

type AdminLoginFormProps = {
  mode: Mode;
};

export function AdminLoginForm({ mode }: AdminLoginFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const response = await fetch(
      mode === "setup" ? "/api/admin/setup" : "/api/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          password,
        }),
      },
    );

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    setIsPending(false);

    if (!response.ok) {
      setError(payload?.error || "Не удалось выполнить вход");
      return;
    }

    window.location.href = "/admin";
  }

  const isSetup = mode === "setup";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="admin-login"
          className="text-sm font-bold text-zinc-900"
        >
          Логин
        </label>
        <input
          id="admin-login"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-red-700"
          autoComplete="username"
          minLength={3}
          required
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="admin-password"
          className="text-sm font-bold text-zinc-900"
        >
          Пароль
        </label>
        <input
          id="admin-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-md border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-red-700"
          type="password"
          autoComplete={isSetup ? "new-password" : "current-password"}
          minLength={8}
          required
        />
        <p className="mt-2 text-sm text-zinc-500">
          Минимум 8 символов, буквы и цифры.
        </p>
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-md bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? "Проверяем..."
          : isSetup
            ? "Создать администратора"
            : "Войти в админку"}
      </button>
    </form>
  );
}
