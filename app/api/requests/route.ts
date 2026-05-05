import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const REQUEST_STATUSES = ["new", "in_progress", "completed", "cancelled"];

type RequestPayload = {
  clientName?: unknown;
  phone?: unknown;
  truckModel?: unknown;
  serviceId?: unknown;
  problemDescription?: unknown;
};

function readRequiredString(
  payload: RequestPayload,
  key: keyof RequestPayload,
  label: string,
) {
  const value = payload[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Поле "${label}" обязательно`);
  }

  return value.trim();
}

function readServiceId(payload: RequestPayload) {
  const value = Number(payload.serviceId);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('Поле "Услуга" обязательно');
  }

  return value;
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const where =
    status && REQUEST_STATUSES.includes(status) ? { status } : undefined;

  const requests = await prisma.request.findMany({
    where,
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

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  let payload: RequestPayload;

  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json(
      { error: "Некорректный JSON в теле запроса" },
      { status: 400 },
    );
  }

  try {
    const clientName = readRequiredString(payload, "clientName", "Имя");
    const phone = readRequiredString(payload, "phone", "Телефон");
    const truckModel = readRequiredString(
      payload,
      "truckModel",
      "Модель грузовика",
    );
    const serviceId = readServiceId(payload);
    const problemDescription = readRequiredString(
      payload,
      "problemDescription",
      "Описание проблемы",
    );

    if (phone.length < 6 || phone.length > 30) {
      return NextResponse.json(
        { error: "Укажите корректный телефон" },
        { status: 400 },
      );
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Выбранная услуга не найдена" },
        { status: 400 },
      );
    }

    const newRequest = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.request.create({
        data: {
          clientName,
          phone,
          truckModel,
          serviceId: service.id,
          problemDescription,
          status: "new",
        },
      });

      await tx.notification.create({
        data: {
          requestId: createdRequest.id,
          channel: "max_web",
          status: "pending",
        },
      });

      return createdRequest;
    });

    return NextResponse.json(
      {
        ok: true,
        requestId: newRequest.id,
        notificationStatus: "pending",
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось создать заявку";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
