const API_URL = "http://127.0.0.1:8000";


export async function getMyProjects() {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects/my`,
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
        : "Erro ao buscar seus projetos."
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


export async function getProjectProposals(projectId) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects/${projectId}/proposals`,
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
        : "Erro ao buscar propostas."
    );
  }

  return data;
}


export async function acceptProposal(proposalId) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects/proposals/${proposalId}/accept`,
    {
      method: "POST",

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
        : "Erro ao aceitar proposta."
    );
  }

  return data;
}


export async function completeProject(projectId) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects/${projectId}/complete`,
    {
      method: "PATCH",

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
        : "Erro ao concluir projeto."
    );
  }

  return data;
}


export async function createProject(projectData) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/projects`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        title: projectData.title,
        description: projectData.description,
        category_id: projectData.category_id,
        location: projectData.location,
        budget: projectData.budget
          ? Number(projectData.budget)
          : null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao criar projeto."
    );
  }

  return data;
}