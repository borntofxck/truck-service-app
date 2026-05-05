import Image from "next/image";
import { RequestForm, type ServiceOption } from "@/app/services/RequestForm";
import { ServicePriceCards } from "@/app/ServicePriceCards";
import {
  company,
  landingServices,
  processSteps,
  reviewHighlights,
  whyChooseUs,
} from "@/lib/siteContent";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const heroImage =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=85";

const workshopImage =
  "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=85";

export default async function Home() {
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

  const priceServices = services.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    priceFrom: service.priceFrom?.toString() ?? null,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: company.legalName,
    url: company.siteUrl,
    image: heroImage,
    telephone: company.phones.map((phone) => phone.label),
    sameAs: [company.mapUrl, company.yandexMapUrl],
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: company.city,
      addressCountry: "RU",
    },
    areaServed: company.city,
    makesOffer: landingServices.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.description,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/88 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <a href="#" className="font-black uppercase tracking-wide">
            {company.name}
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-200 md:flex">
            <a href="#prices" className="transition hover:text-white">
              Цены
            </a>
            <a href="#reviews" className="transition hover:text-white">
              Отзывы
            </a>
            <a href="#contacts" className="transition hover:text-white">
              Контакты
            </a>
          </nav>
          <a
            href="#request"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
          >
            Заявка
          </a>
        </div>
      </header>

      <section
        className="relative isolate overflow-hidden bg-zinc-950 text-white"
        style={{ position: "relative" }}
      >
        <Image
          src={heroImage}
          alt="Грузовой автомобиль на трассе"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.4]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.96),rgba(9,9,11,0.74),rgba(9,9,11,0.28))]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-57px)] max-w-7xl content-center gap-10 px-4 py-14 md:grid-cols-[1fr_0.9fr] md:px-6">
          <div className="animate-fade-up">
            <p className="section-kicker text-red-300">
              Грузовой автосервис в Новосибирске
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.03] md:text-7xl">
              Ремонт грузовиков без лишней волокиты
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 md:text-xl">
              Диагностика, ходовая, тормоза, пневматика, электрика, двигатель,
              КПП, прицепы и спецтехника. Сначала разбираемся в проблеме, потом
              согласуем работы.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#request"
                className="rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/25 transition hover:-translate-y-0.5 hover:bg-red-500"
              >
                Оставить заявку
              </a>
              <a
                href="#prices"
                className="rounded-md bg-white px-5 py-3 text-sm font-bold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-100"
              >
                Посмотреть цены
              </a>
              <a
                href={company.yandexMapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Открыть карту
              </a>
            </div>
          </div>

          <aside className="animate-fade-up-delay self-end rounded-md border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
            <p className="section-kicker text-red-300">Когда обращаться</p>
            <h2 className="mt-3 text-2xl font-black">
              Если техника не должна простаивать
            </h2>
            <div className="mt-5 grid gap-3">
              {[
                "Нужно быстро понять причину неисправности",
                "Нужен ремонт перед рейсом или после поломки",
                "Важно заранее согласовать работы и стоимость",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-white/10 bg-white/10 p-4 text-sm font-semibold leading-6 text-zinc-100"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="max-w-3xl animate-on-scroll">
          <p className="section-kicker text-red-700">Почему мы</p>
          <h2 className="mt-3 text-3xl font-black md:text-5xl">
            Клиенту важно не гадать, а понимать, что происходит с техникой
          </h2>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item) => (
            <article
              key={item.title}
              className="flex h-full min-h-48 flex-col rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-3 flex-1 leading-7 text-zinc-700">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-6">
          <div
            className="relative min-h-80 overflow-hidden rounded-md"
            style={{ position: "relative" }}
          >
            <Image
              src={workshopImage}
              alt="Рабочая зона автосервиса"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover transition duration-700 hover:scale-105"
            />
          </div>
          <div>
            <p className="section-kicker text-red-300">Услуги</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              Основные работы по грузовой технике
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {landingServices.map((service) => (
                <article
                  key={service.title}
                  className="flex h-full flex-col rounded-md border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-xl font-black">{service.title}</h3>
                  <p className="mt-3 flex-1 leading-7 text-zinc-300">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="prices" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="section-kicker text-red-700">Цены</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              Сколько может стоить ремонт
            </h2>
            <p className="mt-4 leading-8 text-zinc-700">
              Это ориентиры по базовым работам. Нажмите на услугу, и она сразу
              подставится в форму заявки.
            </p>
          </div>
        </div>

        <div className="mt-9">
          <ServicePriceCards services={priceServices} />
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="section-kicker text-red-700">Как всё проходит</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              Минимум лишних действий для клиента
            </h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article
                key={step.title}
                className="flex h-full min-h-48 flex-col rounded-md border border-zinc-200 bg-stone-50 p-5"
              >
                <div className="text-sm font-black text-red-700">
                  Шаг 0{index + 1}
                </div>
                <h3 className="mt-3 text-xl font-black">{step.title}</h3>
                <p className="mt-3 flex-1 leading-7 text-zinc-700">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="request"
        className="scroll-mt-20 bg-stone-50 px-4 py-16 md:px-6"
      >
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="section-kicker text-red-700">Заявка</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              Опишите проблему, мы уточним детали
            </h2>
            <p className="mt-5 leading-8 text-zinc-700">
              Укажите имя, телефон, технику и что случилось.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-bold text-zinc-900 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {company.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="rounded-md border border-zinc-200 bg-white px-4 py-3 transition hover:border-red-200 hover:text-red-700"
                >
                  {phone.label}
                </a>
              ))}
            </div>
          </div>
          <RequestForm services={serviceOptions} />
        </div>
      </section>

      <section
        id="reviews"
        className="border-y border-zinc-200 bg-white px-4 py-16 md:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="section-kicker text-red-700">Отзывы</p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">
                Что говорят клиенты
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-zinc-700">
                Коротко вынесли главное. Полные отзывы можно проверить на
                картах.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={company.reviewsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold transition hover:border-red-300 hover:text-red-700"
              >
                2ГИС
              </a>
              <a
                href={company.yandexMapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold transition hover:border-red-300 hover:text-red-700"
              >
                Яндекс Карты
              </a>
            </div>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {reviewHighlights.map((review) => (
              <article
                key={review.title}
                className="flex h-full min-h-56 flex-col rounded-md border border-zinc-200 bg-stone-50 p-5"
              >
                <h3 className="text-xl font-black">{review.title}</h3>
                <p className="mt-4 flex-1 leading-7 text-zinc-700">
                  {review.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="bg-stone-50 px-4 py-16 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-kicker text-red-700">Геолокация</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              {company.fullAddress}
            </h2>
            <dl className="mt-7 grid gap-4 text-zinc-700">
              <div>
                <dt className="text-sm font-bold uppercase text-zinc-500">
                  График
                </dt>
                <dd className="mt-1 text-lg font-semibold text-zinc-950">
                  {company.workingHours}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-bold uppercase text-zinc-500">
                  Телефоны
                </dt>
                <dd className="mt-1 grid gap-2 text-lg font-semibold text-zinc-950">
                  {company.phones.map((phone) => (
                    <a
                      key={phone.href}
                      href={phone.href}
                      className="transition hover:text-red-700"
                    >
                      {phone.label}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={company.yandexMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-md bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Открыть в Яндекс Картах
              </a>
              <a
                href={company.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-700"
              >
                Открыть в 2ГИС
              </a>
            </div>
          </div>

          <a
            href={company.yandexMapUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative min-h-80 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 p-6"
          >
            <div className="absolute inset-0 map-grid opacity-70 transition group-hover:opacity-100" />
            <div className="relative flex h-full min-h-72 flex-col justify-between">
              <div className="rounded-md bg-white/90 p-4 shadow-sm backdrop-blur">
                <p className="section-kicker text-red-700">Маршрут</p>
                <p className="mt-2 text-2xl font-black">{company.legalName}</p>
                <p className="mt-2 text-zinc-700">{company.address}</p>
              </div>
              <div className="self-end rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white shadow-xl transition group-hover:-translate-y-1">
                Построить маршрут
              </div>
            </div>
          </a>
        </div>
      </section>

      <footer className="bg-zinc-950 px-4 py-8 text-white md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black">{company.name}</p>
            <p className="mt-1 text-sm text-zinc-400">
              Ремонт грузовых автомобилей и спецтехники в Новосибирске.
            </p>
          </div>
          <a
            href="/privacy"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            Политика конфиденциальности
          </a>
        </div>
      </footer>
    </main>
  );
}
