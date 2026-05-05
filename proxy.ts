import type { NextRequest } from "next/server";

function unauthorizedResponse() {
  return new Response("Требуется авторизация администратора", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Truck Service Admin"',
    },
  });
}

function isValidBasicAuth(request: NextRequest) {
  const login = process.env.ADMIN_LOGIN;
  const password = process.env.ADMIN_PASSWORD;

  if (!login || !password) {
    return false;
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  try {
    const credentials = atob(authHeader.slice("Basic ".length));
    const separatorIndex = credentials.indexOf(":");

    if (separatorIndex === -1) {
      return false;
    }

    const providedLogin = credentials.slice(0, separatorIndex);
    const providedPassword = credentials.slice(separatorIndex + 1);

    return providedLogin === login && providedPassword === password;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRequestCreate =
    pathname === "/api/requests" && request.method === "POST";

  if (isPublicRequestCreate) {
    return;
  }

  if (!isValidBasicAuth(request)) {
    return unauthorizedResponse();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/requests/:path*"],
};
