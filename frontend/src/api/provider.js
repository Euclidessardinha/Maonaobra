
const API_URL = import.meta.env.VITE_API_URL;

export async function getProviderRequests() {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/requests/provider`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  const data = await response.json();


  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao buscar pedidos."
    );
  }


  return data;
}


export async function getServices() {

  const response = await fetch(
    `${API_URL}/services/`
  );


  const data = await response.json();


  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao buscar serviços."
    );
  }


  return data;
}


export async function getMyProviderProfile() {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/providers/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao buscar perfil do prestador."
    );
  }

  return data;
}


export async function getProviderReviews(
  providerId
) {

  const response = await fetch(
    `${API_URL}/reviews/provider/${providerId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao buscar avaliações."
    );
  }

  return data;
}


export async function getOpenProjects() {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao buscar projetos disponíveis."
    );
  }

  return data;
}


export async function getMyProposals() {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/proposals/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao buscar suas propostas."
    );
  }

  return data;
}


export async function createProposal(
  projectId,
  price,
  message
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects/${projectId}/proposals`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        price,
        message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao enviar proposta."
    );
  }

  return data;
}


export async function getProject(projectId) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao buscar projeto."
    );
  }

  return data;
}


export async function getMyProviderReviews() {

  const token =
    localStorage.getItem("access_token");

  const profileResponse = await fetch(
    `${API_URL}/providers/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const profileData =
    await profileResponse.json();

  if (!profileResponse.ok) {
    throw new Error(
      profileData.detail ||
      "Erro ao buscar perfil do prestador."
    );
  }

  const response = await fetch(
    `${API_URL}/reviews/provider/${profileData.id}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Erro ao buscar avaliações."
    );
  }

  return data;
}


// ============================================================
// ATUALIZAR STATUS DE UM PEDIDO
// ============================================================

export async function updateRequestStatus(
  requestId,
  status
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/requests/${requestId}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        status: status,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao atualizar o pedido."
    );
  }

  return data;
}


export async function createProviderProfile(
  profileData
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/providers/profile`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(profileData),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao criar perfil profissional."
    );
  }

  return data;
}


export async function getMyServices() {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/services/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao buscar os seus serviços."
    );
  }

  return data;
}


export async function updateService(
  serviceId,
  serviceData
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/services/${serviceId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(serviceData),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao atualizar o serviço."
    );
  }

  return data;
}


export async function toggleServiceStatus(
  serviceId
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/services/${serviceId}/status`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao alterar o estado do serviço."
    );
  }

  return data;
}


// ============================================================
// EXCLUIR SERVIÇO
// ============================================================

export async function deleteService(
  serviceId
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/services/${serviceId}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao excluir o serviço."
    );
  }

  return data;
}

