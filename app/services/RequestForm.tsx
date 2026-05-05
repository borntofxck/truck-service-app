"use client";

import { FormEvent, useEffect, useState } from "react";

export type ServiceOption = {
  id: number;
  title: string;
  priceFrom: string | null;
};

type RequestFormProps = {
  services: ServiceOption[];
};

const emptyForm = {
  clientName: "",
  phone: "",
  truckModel: "",
  serviceId: "",
  problemDescription: "",
};

export function RequestForm({ services }: RequestFormProps) {
  const [form, setForm] = useState({
    ...emptyForm,
    serviceId: services[0]?.id.toString() ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function selectServiceFromEvent(event: Event) {
      const customEvent = event as CustomEvent<{ serviceId?: string }>;
      const serviceId = customEvent.detail?.serviceId;

      if (!serviceId || !services.some((service) => service.id.toString() === serviceId)) {
        return;
      }

      setForm((current) => ({
        ...current,
        serviceId,
      }));
    }

    window.addEventListener("service-selected", selectServiceFromEvent);

    return () => {
      window.removeEventListener("service-selected", selectServiceFromEvent);
    };
  }, [services]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        serviceId: Number(form.serviceId),
      }),
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      notificationStatus?: string;
    } | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload?.error || "Не удалось отправить заявку");
      return;
    }

    setMessage(
      payload?.notificationStatus === "error"
        ? "Заявка принята. Мы свяжемся с вами для уточнения деталей."
        : "Заявка отправлена. Мы свяжемся с вами для уточнения деталей.",
    );
    setForm({
      ...emptyForm,
      serviceId: services[0]?.id.toString() ?? "",
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-950/5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-zinc-800">
          Имя
          <input
            value={form.clientName}
            onChange={(event) => updateField("clientName", event.target.value)}
            className="rounded-md border border-zinc-300 bg-stone-50 px-3 py-3 font-normal outline-none transition focus:border-red-600 focus:bg-white"
            placeholder="Иван Петров"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-zinc-800">
          Телефон
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="rounded-md border border-zinc-300 bg-stone-50 px-3 py-3 font-normal outline-none transition focus:border-red-600 focus:bg-white"
            placeholder="+7 900 000-00-00"
            required
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-zinc-800">
          Техника
          <input
            value={form.truckModel}
            onChange={(event) => updateField("truckModel", event.target.value)}
            className="rounded-md border border-zinc-300 bg-stone-50 px-3 py-3 font-normal outline-none transition focus:border-red-600 focus:bg-white"
            placeholder="MAN TGX, КамАЗ, Scania"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-zinc-800">
          Услуга
          <select
            value={form.serviceId}
            onChange={(event) => updateField("serviceId", event.target.value)}
            className="rounded-md border border-zinc-300 bg-stone-50 px-3 py-3 font-normal outline-none transition focus:border-red-600 focus:bg-white"
            required
          >
            {services.length === 0 ? (
              <option value="">Добавьте услуги в базу</option>
            ) : null}
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-bold text-zinc-800">
        Что случилось
        <textarea
          value={form.problemDescription}
          onChange={(event) =>
            updateField("problemDescription", event.target.value)
          }
          className="min-h-32 rounded-md border border-zinc-300 bg-stone-50 px-3 py-3 font-normal outline-none transition focus:border-red-600 focus:bg-white"
          placeholder="Например: не заводится, проблемы с тормозами, ошибка на панели"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting || services.length === 0}
        className="mt-5 w-full rounded-md bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-400 md:w-auto"
      >
        {isSubmitting ? "Отправляем..." : "Оставить заявку"}
      </button>

      <p className="mt-3 max-w-2xl text-xs leading-5 text-zinc-500">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <a href="/privacy" className="font-semibold text-red-700 underline">
          политикой конфиденциальности
        </a>
        .
      </p>

      {message ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}
    </form>
  );
}
