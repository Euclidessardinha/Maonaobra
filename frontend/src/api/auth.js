const API_URL = "http://127.0.0.1:8000";

export async function registerUser(userData) {
const response = await fetch(
`${API_URL}/auth/register`,
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(userData),
}
);

const data = await response.json();

if (!response.ok) {
let message = "Erro ao criar conta.";


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

export async function loginUser(email, password) {
const response = await fetch(
`${API_URL}/auth/login`,
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
email: email,
password: password,
}),
}
);

const data = await response.json();

if (!response.ok) {
let message = "Email ou senha incorretos.";


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
