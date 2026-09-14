const API_URL = import.meta.env.VITE_API_URL;

export async function createService(serviceData) {

  const token =
    localStorage.getItem("access_token");


  const response = await fetch(
    `${API_URL}/services/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        category_id: Number(
          serviceData.category_id
        ),

        title: serviceData.title,

        description: serviceData.description,

        price: Number(
          serviceData.price
        ),
      }),
    }
  );


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Erro ao criar serviço."
    );

  }


  return data;

}