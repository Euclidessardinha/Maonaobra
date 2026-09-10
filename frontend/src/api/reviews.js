
const API_URL = "http://127.0.0.1:8000";


export async function createReview(
  projectId,
  rating,
  comment
) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/reviews/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        project_id: projectId,
        rating: rating,
        comment: comment || null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao enviar avaliação."
    );
  }

  return data;
}


export async function getMyReviewProjects() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/reviews/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao buscar avaliações."
    );
  }

  return data;
}


export async function createServiceRequestReview(
  serviceRequestId,
  rating,
  comment
) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      project_id: null,
      service_request_id: serviceRequestId,
      rating: rating,
      comment: comment || null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao enviar avaliação."
    );
  }

  return data;
}

