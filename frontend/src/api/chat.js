const API_URL = import.meta.env.VITE_API_URL;

export async function createConversation(providerId) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/chat/conversations`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        provider_id: Number(providerId),
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao criar conversa."
    );

  }

  return data;
}


export async function getMyConversations() {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/chat/conversations`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao carregar conversas."
    );

  }

  return data;
}


export async function getConversationMessages(
  conversationId
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/chat/conversations/${Number(
      conversationId
    )}/messages`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao carregar mensagens."
    );

  }

  return data;
}


export async function sendMessage(
  conversationId,
  content
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/chat/conversations/${Number(
      conversationId
    )}/messages`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        content: content.trim(),
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao enviar mensagem."
    );

  }

  return data;
}