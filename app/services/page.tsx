import Link from "next/link";
import { RequestForm, type ServiceOption } from "@/app/services/RequestForm";
import { company } from "@/lib/siteContent";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const serviceOptions: ServiceOption[] = services.map((service) => ({
    id: service.id,
    title: service.title,
    priceFrom: service.priceFrom?.toString() ?? null,
  }));

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 text-zinc-950 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-red-700">
          На главную
        </Link>
        <p className="section-kicker mt-8 text-red-700">{company.name}</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">
          Оставить заявку на ремонт грузовика
        </h1>
        <p className="mt-4 max-w-2xl leading-8 text-zinc-700">
          Выберите услугу, укажите технику и коротко опишите проблему. Заявка
          попадет в базу данных и будет доступна в админ-панели.
        </p>
        <div className="mt-8">
          <RequestForm services={serviceOptions} />
        </div>
      </div>
    </main>
  );
}
