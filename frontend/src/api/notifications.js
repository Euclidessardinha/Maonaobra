const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("access_token");
}


// =========================================================
// OBTER NOTIFICAÇÕES
// =========================================================

export async function getNotifications() {

  const response = await fetch(
    `${API_URL}/notifications`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );


  if (!response.ok) {
    throw new Error(
      "Erro ao carregar notificações."
    );
  }


  return response.json();

}


// =========================================================
// CONTADOR DE NÃO LIDAS
// =========================================================

export async function getUnreadNotificationsCount() {

  const response = await fetch(
    `${API_URL}/notifications/unread/count`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );


  if (!response.ok) {
    throw new Error(
      "Erro ao carregar contador de notificações."
    );
  }


  return response.json();

}


// =========================================================
// MARCAR UMA NOTIFICAÇÃO COMO LIDA
// =========================================================

export async function markNotificationAsRead(
  notificationId
) {

  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );


  if (!response.ok) {
    throw new Error(
      "Erro ao marcar notificação como lida."
    );
  }


  return response.json();

}


// =========================================================
// MARCAR TODAS AS NOTIFICAÇÕES DE UMA CONVERSA COMO LIDAS
// =========================================================

export async function markConversationNotificationsAsRead(
  conversationId
) {

  const response = await fetch(
    `${API_URL}/notifications/conversation/${conversationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );


  if (!response.ok) {
    throw new Error(
      "Erro ao marcar notificações da conversa como lidas."
    );
  }


  return response.json();

}