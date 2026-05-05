import Link from "next/link";
import { AdminRequests, type AdminRequest } from "@/app/admin/AdminRequests";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const allowedStatuses = ["new", "in_progress", "completed", "cancelled"];

type AdminPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { status } = await searchParams;
  const activeStatus =
    status && allowedStatuses.includes(status) ? status : undefined;

  const requests = await prisma.request.findMany({
    where: activeStatus
      ? {
          status: activeStatus,
        }
      : undefined,
    include: {
      service: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const adminRequests: AdminRequest[] = requests.map((request) => ({
    id: request.id,
    clientName: request.clientName,
    phone: request.phone,
    truckModel: request.truckModel,
    problemDescription: request.problemDescription,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    service: {
      title: request.service.title,
    },
  }));

  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-10 text-zinc-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end">
          <div>
            <Link href="/" className="text-sm font-semibold text-red-800">
              На главную
            </Link>
            <h1 className="mt-5 text-4xl font-bold">Админ-панель</h1>
            <p className="mt-3 text-zinc-700">
              Просмотр заявок, фильтр по статусу и обработка обращений.
            </p>
          </div>
          <div className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-zinc-800">
            Всего на экране: {adminRequests.length}
          </div>
        </div>

        <div className="mt-6">
          <AdminRequests
            requests={adminRequests}
            activeStatus={activeStatus}
          />
        </div>
      </div>
    </main>
  );
}
