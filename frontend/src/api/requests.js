
const API_URL = "http://127.0.0.1:8000";


// ============================================================
// CLIENTE - CRIAR PEDIDO DE SERVIÇO
// ============================================================

export async function createServiceRequest(
  serviceId,
  description,
  location,
  requestedDate = null
) {

  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/requests/`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      service_id: serviceId,
      description,
      location,
      requested_date: requestedDate
        ? new Date(requestedDate).toISOString()
        : null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao enviar solicitação."
    );
  }

  return data;
}


// ============================================================
// CLIENTE - VER OS PRÓPRIOS PEDIDOS
// ============================================================

export async function getMyRequests() {

  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/requests/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao buscar seus pedidos."
    );
  }

  return data;
}

