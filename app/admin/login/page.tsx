import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/login/AdminLoginForm";
import { getAdminBootstrapState, getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const [{ hasAdmins }, session] = await Promise.all([
    getAdminBootstrapState(),
    getAdminSession(),
  ]);

  if (!hasAdmins) {
    redirect("/admin/setup");
  }

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-10 text-zinc-950">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-semibold text-red-800">
          На главную
        </Link>
        <h1 className="mt-5 text-4xl font-bold">Вход в админку</h1>
        <p className="mt-3 text-zinc-700">
          Доступ к заявкам открыт только администраторам из базы данных.
        </p>

        <AdminLoginForm mode="login" />
      </div>
    </main>
  );
}
