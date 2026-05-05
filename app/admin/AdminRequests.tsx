"use client";

import Link from "next/link";
import { useState } from "react";

export type AdminRequest = {
  id: number;
  clientName: string;
  phone: string;
  truckModel: string;
  problemDescription: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  service: {
    title: string;
  };
};

type AdminRequestsProps = {
  requests: AdminRequest[];
  activeStatus?: string;
};

const statuses = [
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Завершенные" },
  { value: "cancelled", label: "Отмененные" },
];

const statusLabels: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminRequests({
  requests: initialRequests,
  activeStatus,
}: AdminRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(requestId: number, status: string) {
    setPendingId(requestId);
    setError(null);

    const response = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      request?: AdminRequest;
    } | null;

    setPendingId(null);

    if (!response.ok || !payload?.request) {
      setError(payload?.error || "Не удалось обновить статус");
      return;
    }

    setRequests((current) =>
      current.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: payload.request!.status,
              updatedAt: payload.request!.updatedAt,
            }
          : item,
      ),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin"
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${
            !activeStatus
              ? "border-red-700 bg-red-700 text-white"
              : "border-zinc-300 bg-white text-zinc-800"
          }`}
        >
          Все
        </Link>
        {statuses.map((status) => (
          <Link
            key={status.value}
            href={`/admin?status=${status.value}`}
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
              activeStatus === status.value
                ? "border-red-700 bg-red-700 text-white"
                : "border-zinc-300 bg-white text-zinc-800"
            }`}
          >
            {status.label}
          </Link>
        ))}
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {requests.map((request) => (
          <article
            key={request.id}
            className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="text-sm text-zinc-500">
                  #{request.id} · {formatDate(request.createdAt)}
                </div>
                <h2 className="mt-2 text-xl font-bold">
                  {request.clientName}
                </h2>
                <p className="mt-2 text-zinc-700">
                  {request.phone} · {request.truckModel}
                </p>
              </div>
              <div className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800">
                {statusLabels[request.status] || request.status}
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-zinc-700 md:grid-cols-2">
              <p>
                <span className="font-semibold text-zinc-950">Услуга:</span>{" "}
                {request.service.title}
              </p>
              <p>
                <span className="font-semibold text-zinc-950">Обновлено:</span>{" "}
                {formatDate(request.updatedAt)}
              </p>
            </div>

            <p className="mt-4 leading-7 text-zinc-700">
              {request.problemDescription}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-zinc-800">
                Изменить статус
              </label>
              <select
                value={request.status}
                onChange={(event) =>
                  updateStatus(request.id, event.target.value)
                }
                disabled={pendingId === request.id}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-700 disabled:opacity-60"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {statusLabels[status.value]}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}

        {requests.length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-white p-5 text-zinc-700">
            Заявок с таким фильтром пока нет.
          </p>
        ) : null}
      </div>
    </div>
  );
}
