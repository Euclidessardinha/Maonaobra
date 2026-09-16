const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
const token = localStorage.getItem("access_token");

return {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
};
}

async function handleResponse(response) {
const data = await response.json().catch(() => null);

if (!response.ok) {
const message =
data?.detail ||
data?.message ||
"Ocorreu um erro ao processar a solicitação.";

```
throw new Error(message);
```

}

return data;
}

/**

* Buscar os prestadores favoritos do cliente autenticado.
  */
  export async function getMyFavorites() {
  const response = await fetch(
  `${API_URL}/favorites/my`,
  {
  method: "GET",
  headers: getAuthHeaders(),
  }
  );

return handleResponse(response);
}

/**

* Adicionar um prestador aos favoritos.
  */
  export async function addFavorite(providerId) {
  const response = await fetch(
  `${API_URL}/favorites/${providerId}`,
  {
  method: "POST",
  headers: getAuthHeaders(),
  }
  );

return handleResponse(response);
}

/**

* Remover um prestador dos favoritos.
  */
  export async function removeFavorite(providerId) {
  const response = await fetch(
  `${API_URL}/favorites/${providerId}`,
  {
  method: "DELETE",
  headers: getAuthHeaders(),
  }
  );

return handleResponse(response);
}
