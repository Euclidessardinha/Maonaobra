
const API_URL = import.meta.env.VITE_API_URL;

// =========================================================
// FUNÇÃO AUXILIAR
// =========================================================

function getToken() {
  return localStorage.getItem("access_token");
}

async function handleResponse(response, defaultMessage) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

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

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

// =========================================================
// ESTATÍSTICAS
// =========================================================

export async function getAdminStats() {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(
    response,
    "Erro ao buscar estatísticas administrativas."
  );
}

// =========================================================
// USUÁRIOS
// =========================================================

export async function getAdminUsers() {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(response, "Erro ao buscar usuários.");
}

// =========================================================
// ASSINATURA DO USUÁRIO
// =========================================================

export async function getAdminUserSubscription(userId) {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}/subscription`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar assinatura do usuário."
  );
}

export async function updateUserStatus(userId) {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}/status`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
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
  const response = await fetch(`${API_URL}/admin/providers`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(response, "Erro ao buscar prestadores.");
}

export async function updateProviderVerification(providerId) {
  const response = await fetch(
    `${API_URL}/admin/providers/${providerId}/verification`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
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
  const response = await fetch(`${API_URL}/admin/projects`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(response, "Erro ao buscar projetos.");
}

// =========================================================
// SERVIÇOS
// =========================================================

export async function getAdminServices() {
  const response = await fetch(`${API_URL}/admin/services`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(response, "Erro ao buscar serviços.");
}

// =========================================================
// AVALIAÇÕES
// =========================================================

export async function getAdminReviews() {
  const response = await fetch(`${API_URL}/admin/reviews`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(response, "Erro ao buscar avaliações.");
}

// =========================================================
// PROMOÇÕES DE SERVIÇOS
// =========================================================

export async function getAdminServicePromotions() {
  const response = await fetch(
    `${API_URL}/admin/service-promotions`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar promoções de serviços."
  );
}

// =========================================================
// ESTATÍSTICAS DE PROMOÇÕES
// =========================================================

export async function getAdminPromotionStats() {
  const response = await fetch(
    `${API_URL}/admin/service-promotions/stats`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar estatísticas de promoções."
  );
}

// =========================================================
// ATUALIZAR ESTADO DA PROMOÇÃO
// =========================================================

export async function updateAdminPromotionStatus(
  promotionId,
  status
) {
  const response = await fetch(
    `${API_URL}/admin/service-promotions/${promotionId}/status?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "Erro ao atualizar o estado da promoção."
  );
}

// =========================================================
// PLANOS
// =========================================================

export async function getAdminPlans() {
  const response = await fetch(`${API_URL}/admin/plans`, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(response, "Erro ao buscar planos.");
}

// =========================================================
// ATUALIZAR PLANO
// =========================================================

export async function updateAdminPlan(planId, planData) {
  const response = await fetch(
    `${API_URL}/admin/plans/${planId}`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    }
  );

  return await handleResponse(response, "Erro ao atualizar o plano.");
}

// =========================================================
// ESTATÍSTICAS DE ASSINATURAS
// =========================================================

export async function getAdminSubscriptionStats() {
  const response = await fetch(
    `${API_URL}/admin/subscriptions/stats`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar estatísticas das assinaturas."
  );
}

// =========================================================
// PAGAMENTOS MANUAIS
// =========================================================

// Listar pagamentos.
// Filtros opcionais: status e payment_type.

export async function getAdminPayments(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.payment_type && filters.payment_type !== "ALL") {
    params.set("payment_type", filters.payment_type);
  }

  const query = params.toString();
  const url = `${API_URL}/admin/payments${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return await handleResponse(
    response,
    "Erro ao buscar pagamentos."
  );
}

// Estatísticas dos pagamentos e receitas.

export async function getAdminPaymentStats() {
  const response = await fetch(
    `${API_URL}/admin/payments/stats`,
    {
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "Erro ao buscar estatísticas dos pagamentos."
  );
}

// Registar pagamento manual.
// confirm_immediately deve ser true somente quando o administrador
// já confirmou que recebeu o dinheiro fora da plataforma.

export async function createAdminPayment(paymentData) {
  const response = await fetch(
    `${API_URL}/admin/payments`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    }
  );

  return await handleResponse(
    response,
    "Erro ao registar pagamento."
  );
}

// Confirmar pagamento pendente.

export async function confirmAdminPayment(paymentId) {
  const response = await fetch(
    `${API_URL}/admin/payments/${paymentId}/confirm`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  return await handleResponse(
    response,
    "Erro ao confirmar pagamento."
  );
}

// Rejeitar pagamento pendente.

export async function rejectAdminPayment(paymentId, notes = null) {
  const response = await fetch(
    `${API_URL}/admin/payments/${paymentId}/reject`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    }
  );

  return await handleResponse(
    response,
    "Erro ao rejeitar pagamento."
  );
}
