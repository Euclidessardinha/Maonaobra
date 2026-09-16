import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import ClientLayout from "../components/ClientLayout";

import "./ClientProfile.css";

const API_URL = import.meta.env.VITE_API_URL;

function ClientProfile() {

const {
user,
loadUser
} = useAuth();

const [editing, setEditing] = useState(false);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");

const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

// =======================================================
// CARREGAR DADOS DO USUÁRIO
// =======================================================

useEffect(() => {


if (!user) {
  return;
}

setName(user.name || "");
setEmail(user.email || "");
setPhone(user.phone || "");


}, [user]);

// =======================================================
// INICIA EDIÇÃO
// =======================================================

function handleEdit() {


setError("");
setSuccess("");

setName(user?.name || "");
setEmail(user?.email || "");
setPhone(user?.phone || "");

setEditing(true);


}

// =======================================================
// CANCELAR EDIÇÃO
// =======================================================

function handleCancel() {


setName(user?.name || "");
setEmail(user?.email || "");
setPhone(user?.phone || "");

setError("");
setSuccess("");

setEditing(false);


}

// =======================================================
// GUARDAR ALTERAÇÕES
// =======================================================

async function handleSave(event) {


event.preventDefault();

setError("");
setSuccess("");


if (!name.trim()) {

  setError("Digite o seu nome.");

  return;

}


if (!email.trim()) {

  setError("Digite o seu email.");

  return;

}


if (!phone.trim()) {

  setError("Digite o seu telefone.");

  return;

}


const token =
  localStorage.getItem("access_token");


if (!token) {

  setError(
    "Sua sessão expirou. Faça login novamente."
  );

  return;

}


setSaving(true);


try {

  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      })
    }
  );


  const data =
    await response.json().catch(() => null);


  if (!response.ok) {

    throw new Error(
      data?.detail ||
      "Não foi possível atualizar o perfil."
    );

  }


  // Atualizar o usuário no AuthContext
  await loadUser();


  setSuccess(
    "Perfil atualizado com sucesso!"
  );

  setEditing(false);


} catch (error) {

  console.error(
    "Erro ao atualizar perfil:",
    error
  );

  setError(
    error.message ||
    "Ocorreu um erro ao atualizar o perfil."
  );

} finally {

  setSaving(false);

}


}

// =======================================================
// INICIAIS
// =======================================================

function getInitials(nameValue) {


if (!nameValue) {
  return "CL";
}


const parts =
  nameValue
    .trim()
    .split(" ")
    .filter(Boolean);


if (parts.length === 1) {

  return parts[0]
    .slice(0, 2)
    .toUpperCase();

}


return (
  parts[0][0] +
  parts[parts.length - 1][0]
).toUpperCase();


}

// =======================================================
// LOADING
// =======================================================

if (!user) {


return (

  <ClientLayout
    activePage="profile"
    title="Meu perfil"
    subtitle="Consulte e edite as informações da sua conta."
    label="ÁREA DO CLIENTE"
  >

    <div className="client-profile-loading">

      <div className="client-profile-spinner"></div>

      <p>
        Carregando perfil...
      </p>

    </div>

  </ClientLayout>

);


}

// =======================================================
// RENDER
// =======================================================

return (


<ClientLayout
  activePage="profile"
  title="Meu perfil"
  subtitle="Consulte e edite as informações da sua conta."
  label="ÁREA DO CLIENTE"
>

  <div className="client-profile-page">


    {/* =================================================
        HERO
    ================================================= */}

    <section className="client-profile-hero">

      <div className="client-profile-hero-background">

        <span></span>
        <span></span>

      </div>


      <div className="client-profile-hero-content">

        <div className="client-profile-avatar">

          {getInitials(user.name)}

        </div>


        <div className="client-profile-hero-info">

          <span className="client-profile-badge">
            👤 Cliente
          </span>


          <h2>
            {user.name || "Cliente"}
          </h2>


          <p>
            Membro da plataforma MãoNaObra
          </p>

        </div>

      </div>


      <div className="client-profile-watermark">

        {getInitials(user.name)}

      </div>

    </section>


    {/* =================================================
        MENSAGENS
    ================================================= */}

    {error && (

      <div className="client-profile-alert client-profile-alert-error">

        <span>⚠️</span>

        <p>
          {error}
        </p>

      </div>

    )}


    {success && (

      <div className="client-profile-alert client-profile-alert-success">

        <span>✓</span>

        <p>
          {success}
        </p>

      </div>

    )}


    {/* =================================================
        DADOS PESSOAIS
    ================================================= */}

    <section className="client-profile-card">

      <div className="client-profile-card-header">

        <div className="client-profile-card-icon">
          👤
        </div>


        <div className="client-profile-card-heading">

          <div>

            <h3>
              Informações pessoais
            </h3>

            <p>
              Mantenha os seus dados atualizados.
            </p>

          </div>


          {!editing && (

            <button
              type="button"
              className="client-profile-edit-btn"
              onClick={handleEdit}
            >
              ✏️ Editar perfil
            </button>

          )}

        </div>

      </div>


      {!editing ? (

        /* =================================================
           MODO VISUALIZAÇÃO
        ================================================= */

        <div className="client-profile-info-grid">

          <div className="client-profile-info-item">

            <span className="client-profile-info-label">
              Nome completo
            </span>

            <strong>
              {user.name || "Não informado"}
            </strong>

          </div>


          <div className="client-profile-info-item">

            <span className="client-profile-info-label">
              Email
            </span>

            <strong>
              {user.email || "Não informado"}
            </strong>

          </div>


          <div className="client-profile-info-item">

            <span className="client-profile-info-label">
              Telefone
            </span>

            <strong>
              {user.phone || "Não informado"}
            </strong>

          </div>


          <div className="client-profile-info-item">

            <span className="client-profile-info-label">
              Tipo de conta
            </span>

            <strong>
              Cliente
            </strong>

          </div>

        </div>

      ) : (

        /* =================================================
           MODO EDIÇÃO
        ================================================= */

        <form
          className="client-profile-form"
          onSubmit={handleSave}
        >

          <div className="client-profile-form-grid">


            <div className="client-profile-field">

              <label htmlFor="client-profile-name">
                Nome completo
              </label>

              <input
                id="client-profile-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Digite o seu nome"
                maxLength={100}
                disabled={saving}
              />

            </div>


            <div className="client-profile-field">

              <label htmlFor="client-profile-email">
                Email
              </label>

              <input
                id="client-profile-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Digite o seu email"
                disabled={saving}
              />

            </div>


            <div className="client-profile-field">

              <label htmlFor="client-profile-phone">
                Telefone
              </label>

              <input
                id="client-profile-phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Digite o seu telefone"
                maxLength={30}
                disabled={saving}
              />

            </div>


            <div className="client-profile-field">

              <label>
                Tipo de conta
              </label>

              <input
                type="text"
                value="Cliente"
                disabled
                readOnly
              />

            </div>

          </div>


          <div className="client-profile-form-actions">

            <button
              type="button"
              className="client-profile-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="client-profile-save-btn"
              disabled={saving}
            >

              {saving
                ? "A guardar..."
                : "✓ Guardar alterações"
              }

            </button>

          </div>

        </form>

      )}

    </section>


    {/* =================================================
        ESTADO DA CONTA
    ================================================= */}

    <section className="client-profile-card">

      <div className="client-profile-card-header">

        <div className="client-profile-card-icon">
          🛡️
        </div>


        <div>

          <h3>
            Estado da conta
          </h3>

          <p>
            Informações sobre o estado atual da sua conta.
          </p>

        </div>

      </div>


      <div className="client-profile-status">

        <div className="client-profile-status-icon">
          ✓
        </div>


        <div>

          <strong>
            Conta ativa
          </strong>

          <p>
            A sua conta está ativa e pronta para utilizar a plataforma.
          </p>

        </div>

      </div>

    </section>


    {/* =================================================
        AÇÕES
    ================================================= */}

    <section className="client-profile-card">

      <div className="client-profile-card-header">

        <div className="client-profile-card-icon">
          🔧
        </div>


        <div>

          <h3>
            Acesso rápido
          </h3>

          <p>
            Aceda rapidamente às principais áreas da plataforma.
          </p>

        </div>

      </div>


      <div className="client-profile-actions">

        <button
          type="button"
          className="client-profile-primary-btn"
          onClick={() => {
            window.location.href =
              "/client/providers";
          }}
        >
          🔎 Procurar profissionais
        </button>


        <button
          type="button"
          className="client-profile-secondary-btn"
          onClick={() => {
            window.location.href =
              "/client/requests";
          }}
        >
          📋 Ver meus pedidos
        </button>

      </div>

    </section>


  </div>

</ClientLayout>


);

}

export default ClientProfile;
