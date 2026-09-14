const API_URL = import.meta.env.VITE_API_URL;

// =========================================================
// FUNÇÃO AUXILIAR
// =========================================================

function getToken() {
  return localStorage.getItem("access_token");
}


async function handleResponse(response, defaultMessage) {
  const data = await response.json();

  if (!response.ok) {
    let message = defaultMessage;

    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail
        .map((item) => item.msg || "Erro de validação.")
        .join(", ");
    } else if (data.detail) {
      message = JSON.stringify(data.detail);
    }

    throw new Error(message);
  }

  return data;
}


// =========================================================
// ESTATÍSTICAS
// =========================================================

export async function getAdminStats() {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar estatísticas administrativas."
  );
}


// =========================================================
// USUÁRIOS
// =========================================================

export async function getAdminUsers() {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar usuários."
  );
}


export async function updateUserStatus(userId) {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/users/${userId}/status`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao alterar o estado do usuário."
  );
}


// =========================================================
// PRESTADORES
// =========================================================

export async function getAdminProviders() {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/providers`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar prestadores."
  );
}


export async function updateProviderVerification(
  providerId
) {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/providers/${providerId}/verification`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao alterar a verificação do prestador."
  );
}


// =========================================================
// PROJETOS
// =========================================================

export async function getAdminProjects() {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar projetos."
  );
}


// =========================================================
// SERVIÇOS
// =========================================================

export async function getAdminServices() {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/services`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar serviços."
  );
}


// =========================================================
// AVALIAÇÕES
// =========================================================

export async function getAdminReviews() {

  const token = getToken();

  const response = await fetch(
    `${API_URL}/admin/reviews`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar avaliações."
  );
}