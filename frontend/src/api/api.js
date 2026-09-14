
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories/`);

  if (!response.ok) {
    throw new Error("Erro ao buscar categorias.");
  }

  return await response.json();
}

