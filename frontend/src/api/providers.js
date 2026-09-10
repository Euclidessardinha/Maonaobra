const API_URL = "http://127.0.0.1:8000";

export async function getProviders(
  search = "",
  categoryId = null,
  location = ""
) {
  const token =
    localStorage.getItem("access_token");

  const params = new URLSearchParams();

  // Pesquisa textual
  if (search && search.trim() !== "") {
    params.append(
      "search",
      search.trim()
    );
  }

  // Categoria
  if (
    categoryId !== null &&
    categoryId !== ""
  ) {
    params.append(
      "category_id",
      Number(categoryId)
    );
  }

  // Localização
  if (
    location &&
    location.trim() !== ""
  ) {
    params.append(
      "location",
      location.trim()
    );
  }

  const queryString =
    params.toString();

  const url = queryString
    ? `${API_URL}/providers?${queryString}`
    : `${API_URL}/providers`;

  console.log(
    "URL dos profissionais:",
    url
  );

  const response = await fetch(
    url,
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
        : "Erro ao buscar profissionais."
    );
  }

  return data;
}

export async function getProviderById(providerId) {

  const token =
    localStorage.getItem("access_token");

  const response = await fetch(
    `${API_URL}/providers/${Number(providerId)}`,
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
        : "Erro ao buscar profissional."
    );
  }

  return data;
}