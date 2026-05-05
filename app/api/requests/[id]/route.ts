import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REQUEST_STATUSES = ["new", "in_progress", "completed", "cancelled"];

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const requestId = Number(id);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    return NextResponse.json(
      { error: "Некорректный идентификатор заявки" },
      { status: 400 },
    );
  }

  const payload = (await request.json().catch(() => null)) as {
    status?: unknown;
  } | null;

  if (
    !payload ||
    typeof payload.status !== "string" ||
    !REQUEST_STATUSES.includes(payload.status)
  ) {
    return NextResponse.json(
      { error: "Некорректный статус заявки" },
      { status: 400 },
    );
  }

  const updatedRequest = await prisma.request.update({
    where: {
      id: requestId,
    },
    data: {
      status: payload.status,
    },
    include: {
      service: {
        select: {
          title: true,
        },
      },
    },
  });

  return NextResponse.json({ request: updatedRequest });
}
