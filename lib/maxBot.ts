const DEFAULT_MAX_API_BASE_URL = "https://platform-api.max.ru";

type SendMaxMessageResult = {
  status: "sent";
  response: unknown;
};

function getRecipientQuery() {
  const chatId = process.env.MAX_CHAT_ID?.trim();
  const userId = process.env.MAX_USER_ID?.trim();

  if (chatId) {
    return new URLSearchParams({ chat_id: chatId });
  }

  if (userId) {
    return new URLSearchParams({ user_id: userId });
  }

  throw new Error("Не задан MAX_CHAT_ID или MAX_USER_ID");
}

export async function sendMaxMessage(
  text: string,
): Promise<SendMaxMessageResult> {
  const token = process.env.MAX_BOT_TOKEN?.trim();

  if (!token) {
    throw new Error("Не задан MAX_BOT_TOKEN");
  }

  const apiBaseUrl =
    process.env.MAX_API_BASE_URL?.trim() || DEFAULT_MAX_API_BASE_URL;
  const recipientQuery = getRecipientQuery();
  const url = `${apiBaseUrl.replace(/\/$/, "")}/messages?${recipientQuery}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `MAX API вернул ${response.status}: ${details.slice(0, 500)}`,
    );
  }

  const responseBody = await response.json().catch(() => null);

  return {
    status: "sent",
    response: responseBody,
  };
}
