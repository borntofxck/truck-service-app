"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

const statusStyles: Record<string, string> = {
  new: "bg-red-50 text-red-800 border-red-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusActions(status: string) {
  if (status === "new") {
    return [
      { status: "in_progress", label: "Взять в работу", primary: true },
      { status: "cancelled", label: "Отменить" },
    ];
  }

  if (status === "in_progress") {
    return [
      { status: "completed", label: "Завершить", primary: true },
      { status: "cancelled", label: "Отменить" },
      { status: "new", label: "Вернуть в новые" },
    ];
  }

  if (status === "completed") {
    return [{ status: "in_progress", label: "Вернуть в работу" }];
  }

  if (status === "cancelled") {
    return [{ status: "new", label: "Вернуть в новые" }];
  }

  return [];
}

export function AdminRequests({
  requests: initialRequests,
  activeStatus,
}: AdminRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshRequests = useCallback(async () => {
    const params = activeStatus
      ? `?status=${encodeURIComponent(activeStatus)}`
      : "";
    const response = await fetch(`/api/requests${params}`, {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as {
      requests?: AdminRequest[];
    } | null;

    if (!response.ok || !Array.isArray(payload?.requests)) {
      return;
    }

    setRequests(payload.requests);
  }, [activeStatus]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshRequests();
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [refreshRequests]);

  const currentFilterLabel = useMemo(() => {
    if (!activeStatus) {
      return "Все заявки";
    }

    return statuses.find((status) => status.value === activeStatus)?.label;
  }, [activeStatus]);

  async function updateStatus(requestId: number, status: string) {
    try {
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

      if (!response.ok || !payload?.request) {
        setError(payload?.error || "Не удалось обновить статус");
        return;
      }

      setRequests((current) => {
        if (activeStatus && payload.request!.status !== activeStatus) {
          return current.filter((item) => item.id !== requestId);
        }

        return current.map((item) =>
          item.id === requestId ? payload.request! : item,
        );
      });

      await refreshRequests();
    } catch {
      setError("Не удалось обновить статус");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
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

        <div className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-zinc-800">
          {currentFilterLabel}: {requests.length}
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {requests.map((request) => {
          const actions = getStatusActions(request.status);
          const isPending = pendingId === request.id;

          return (
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
                <div
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    statusStyles[request.status] ||
                    "border-zinc-200 bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {statusLabels[request.status] || request.status}
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-zinc-700 md:grid-cols-2">
                <p>
                  <span className="font-semibold text-zinc-950">Услуга:</span>{" "}
                  {request.service.title}
                </p>
                <p>
                  <span className="font-semibold text-zinc-950">
                    Обновлено:
                  </span>{" "}
                  {formatDate(request.updatedAt)}
                </p>
              </div>

              <p className="mt-4 leading-7 text-zinc-700">
                {request.problemDescription}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() => updateStatus(request.id, action.status)}
                    disabled={isPending}
                    className={`rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      action.primary
                        ? "bg-red-700 text-white hover:bg-red-800"
                        : "border border-zinc-300 bg-white text-zinc-800 hover:border-red-300 hover:text-red-700"
                    }`}
                  >
                    {isPending ? "Обновляем..." : action.label}
                  </button>
                ))}
              </div>
            </article>
          );
        })}

        {requests.length === 0 ? (
          <p className="rounded-md border border-zinc-200 bg-white p-5 text-zinc-700">
            Заявок с таким фильтром пока нет.
          </p>
        ) : null}
      </div>
    </div>
  );
}
