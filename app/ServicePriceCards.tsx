"use client";

type ServiceCard = {
  id: number;
  title: string;
  description: string | null;
  priceFrom: string | null;
};

type ServicePriceCardsProps = {
  services: ServiceCard[];
};

function formatPrice(price: string | null) {
  if (!price) {
    return "стоимость после диагностики";
  }

  return `от ${Number(price).toLocaleString("ru-RU")} ₽`;
}

export function ServicePriceCards({ services }: ServicePriceCardsProps) {
  function selectService(serviceId: number) {
    window.dispatchEvent(
      new CustomEvent("service-selected", {
        detail: {
          serviceId: serviceId.toString(),
        },
      }),
    );

    document.getElementById("request")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          onClick={() => selectService(service.id)}
          className="group flex h-full min-h-44 flex-col rounded-md border border-zinc-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-xl"
        >
          <span className="text-sm font-black text-red-700">
            {formatPrice(service.priceFrom)}
          </span>
          <span className="mt-3 text-xl font-black">{service.title}</span>
          <span className="mt-3 flex-1 leading-7 text-zinc-700">
            {service.description || "Точную стоимость назовем после осмотра."}
          </span>
          <span className="mt-5 text-sm font-black text-zinc-950 transition group-hover:text-red-700">
            Выбрать услугу
          </span>
        </button>
      ))}
    </div>
  );
}
