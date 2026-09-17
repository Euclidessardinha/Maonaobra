import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import NotificationBell from "../components/NotificationBell";

import { getProviderRequests } from "../api/provider";

import "./ProviderRequests.css";

function ProviderRequests() {

const { user, logout } = useAuth();

const [requests, setRequests] = useState([]);

const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

const [menuOpen, setMenuOpen] = useState(false);

/* =====================================================
MODO CLIENTE
===================================================== */

function handleClientMode() {


setMenuOpen(false);

window.location.href = "/client";


}

/* =====================================================
CARREGAR PEDIDOS
===================================================== */

useEffect(() => {


async function loadRequests() {

  try {

    setLoading(true);

    setError("");

    const data = await getProviderRequests();

    setRequests(
      Array.isArray(data)
        ? data
        : []
    );

  } catch (error) {

    console.error(
      "Erro ao carregar pedidos:",
      error
    );

    setError(
      error.message ||
      "Erro ao carregar pedidos recebidos."
    );

  } finally {

    setLoading(false);

  }

}

loadRequests();


}, []);

/* =====================================================
ESC
===================================================== */

useEffect(() => {


function handleEscape(event) {

  if (event.key === "Escape") {

    setMenuOpen(false);

  }

}

document.addEventListener(
  "keydown",
  handleEscape
);

return () => {

  document.removeEventListener(
    "keydown",
    handleEscape
  );

};


}, []);

/* =====================================================
BLOQUEAR SCROLL
===================================================== */

useEffect(() => {


if (menuOpen) {

  document.body.style.overflow = "hidden";

} else {

  document.body.style.overflow = "";

}

return () => {

  document.body.style.overflow = "";

};


}, [menuOpen]);

/* =====================================================
FECHAR MENU
===================================================== */

function closeMenu() {


setMenuOpen(false);


}

/* =====================================================
LOGOUT
===================================================== */

function handleLogout() {


setMenuOpen(false);

logout();


}

/* =====================================================
INICIAIS
===================================================== */

function getInitials(name) {


if (!name) {

  return "P";

}

const parts = name
  .trim()
  .split(" ");

if (parts.length === 1) {

  return parts[0]
    .substring(0, 2)
    .toUpperCase();

}

return (
  parts[0][0] +
  parts[parts.length - 1][0]
).toUpperCase();


}

/* =====================================================
STATUS
===================================================== */

function getStatusLabel(status) {


const statuses = {

  PENDING: "Pendente",

  ACCEPTED: "Aceito",

  IN_PROGRESS: "Em andamento",

  COMPLETED: "Concluído",

  CANCELLED: "Cancelado",

  REJECTED: "Recusado"

};

return statuses[status] || status || "Desconhecido";


}

function getStatusClass(status) {


if (!status) {

  return "provider-request-status-pending";

}

return `provider-request-status-${status
  .toLowerCase()
  .replace("_", "-")}`;


}

/* =====================================================
FORMATO DE PREÇO
===================================================== */

function formatPrice(price) {


if (
  price === null ||
  price === undefined ||
  price === ""
) {

  return "Preço não definido";

}

return `${Number(price).toLocaleString(
  "pt-MZ"
)} MT`;


}

/* =====================================================
DATA
===================================================== */

function formatDate(date) {


if (!date) {

  return "";

}

const parsedDate = new Date(date);

if (
  Number.isNaN(
    parsedDate.getTime()
  )
) {

  return "";

}

return parsedDate.toLocaleDateString(
  "pt-MZ",
  {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }
);


}

/* =====================================================
RENDER
===================================================== */

return (


<div className="provider-requests-page">


  {/* =================================================
      MOBILE HEADER
  ================================================= */}

  <header className="provider-requests-mobile-header">

    <button
      type="button"
      className="provider-requests-hamburger"
      onClick={() => setMenuOpen(true)}
      aria-label="Abrir menu"
      aria-expanded={menuOpen}
    >

      <span></span>
      <span></span>
      <span></span>

    </button>


    <div className="provider-requests-mobile-logo">

      Mão<span>NaObra</span>

    </div>


    <div className="provider-requests-mobile-notification">

      <NotificationBell />

    </div>

  </header>


  {/* =================================================
      OVERLAY
  ================================================= */}

  {menuOpen && (

    <div
      className="provider-requests-overlay"
      onClick={closeMenu}
      aria-hidden="true"
    />

  )}


  {/* =================================================
      SIDEBAR
  ================================================= */}

  <aside
    className={
      `provider-requests-sidebar ${
        menuOpen
          ? "provider-requests-sidebar-open"
          : ""
      }`
    }
  >


    <button
      type="button"
      className="provider-requests-sidebar-close"
      onClick={closeMenu}
      aria-label="Fechar menu"
    >

      ×

    </button>


    {/* BRAND */}

    <div className="provider-requests-brand">

      <div className="provider-requests-brand-mark">
        M
      </div>

      <div>

        <div className="provider-requests-brand-name">

          Mão<span>NaObra</span>

        </div>

        <div className="provider-requests-brand-area">

          Área profissional

        </div>

      </div>

    </div>


    {/* ÁREA */}

    <div className="provider-requests-area-badge">

      <div className="provider-requests-area-icon">
        🛠️
      </div>

      <div>

        <strong>
          ÁREA DO PRESTADOR
        </strong>

        <span>
          Gerencie o seu trabalho
        </span>

      </div>

    </div>


    <div className="provider-requests-nav-title">
      MENU PRINCIPAL
    </div>


    {/* NAV */}

    <nav className="provider-requests-nav">


      <a
        href="/provider"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          ◈
        </span>

        <span>
          Visão geral
        </span>

      </a>


      <a
        href="/provider/services"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          🔧
        </span>

        <span>
          Meus serviços
        </span>

      </a>


      <a
        href="/provider/services/new"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          ＋
        </span>

        <span>
          Criar serviço
        </span>

      </a>


      <a
        href="/provider/requests"
        onClick={closeMenu}
        className="provider-requests-nav-link active"
      >

        <span className="provider-requests-nav-icon">
          ▣
        </span>

        <span>
          Pedidos recebidos
        </span>

      </a>


      <a
        href="/provider/projects"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          ◉
        </span>

        <span>
          Projetos disponíveis
        </span>

      </a>


      <a
        href="/provider/chat"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          ◌
        </span>

        <span>
          Mensagens
        </span>

      </a>


      <a
        href="/provider/reviews"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          ★
        </span>

        <span>
          Avaliações
        </span>

      </a>


      <div className="provider-requests-nav-divider"></div>


      <div className="provider-requests-nav-title">
        CONTA
      </div>


      <a
        href="/provider/profile"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          ○
        </span>

        <span>
          Meu perfil
        </span>

      </a>


      <a
        href="/"
        onClick={closeMenu}
        className="provider-requests-nav-link"
      >

        <span className="provider-requests-nav-icon">
          ⌂
        </span>

        <span>
          Página inicial
        </span>

      </a>


    </nav>


    {/* =================================================
        BOTTOM
    ================================================= */}

    <div className="provider-requests-sidebar-bottom">


      <button
        type="button"
        className="provider-requests-client-mode"
        onClick={handleClientMode}
      >

        <span className="provider-requests-client-icon">
          👤
        </span>

        <span>

          <strong>
            Modo Cliente
          </strong>

          <small>
            Procurar profissionais
          </small>

        </span>

        <span className="provider-requests-client-arrow">
          →
        </span>

      </button>


      <div className="provider-requests-user">

        <div className="provider-requests-avatar">

          {getInitials(user?.name)}

        </div>

        <div className="provider-requests-user-info">

          <strong>
            {user?.name || "Prestador"}
          </strong>

          <span>
            Prestador
          </span>

        </div>

      </div>


      <button
        type="button"
        onClick={handleLogout}
        className="provider-requests-logout"
      >

        <span>
          ↪
        </span>

        Sair da conta

      </button>


    </div>

  </aside>


  {/* =================================================
      MAIN
  ================================================= */}

  <main className="provider-requests-main">


    {/* =================================================
        TOPBAR
    ================================================= */}

    <header className="provider-requests-topbar">


      <div>

        <div className="provider-requests-heading-label">

          <span></span>

          PAINEL PROFISSIONAL

        </div>


        <h1>
          Pedidos recebidos
        </h1>


        <p>
          Veja e acompanhe os pedidos enviados
          pelos clientes para os seus serviços.
        </p>

      </div>


      <div className="provider-requests-actions">

        <NotificationBell />


        <button
          type="button"
          className="provider-requests-client-btn"
          onClick={handleClientMode}
        >

          👤

          <span>
            Área do Cliente
          </span>

        </button>


        <a
          href="/provider"
          className="provider-requests-back"
        >

          ←

          <span>
            Dashboard
          </span>

        </a>

      </div>

    </header>


    {/* =================================================
        ERROR
    ================================================= */}

    {error && (

      <div className="provider-requests-alert">

        <div className="provider-requests-alert-icon">
          !
        </div>

        <div>

          <strong>
            Não foi possível carregar os pedidos
          </strong>

          <p>
            {error}
          </p>

        </div>

      </div>

    )}


    {/* =================================================
        LOADING
    ================================================= */}

    {loading && (

      <div className="provider-requests-loading">

        <div className="provider-requests-spinner"></div>

        <h3>
          Carregando pedidos...
        </h3>

        <p>
          Estamos buscando os pedidos enviados
          pelos clientes.
        </p>

      </div>

    )}


    {/* =================================================
        EMPTY
    ================================================= */}

    {!loading &&
      !error &&
      requests.length === 0 && (

      <div className="provider-requests-empty">

        <div className="provider-requests-empty-icon">
          ▣
        </div>

        <h2>
          Nenhum pedido recebido
        </h2>

        <p>
          Quando um cliente solicitar um dos
          seus serviços, o pedido aparecerá aqui.
        </p>

        <a
          href="/provider/services"
          className="provider-requests-empty-btn"
        >
          Ver meus serviços
        </a>

      </div>

    )}


    {/* =================================================
        REQUESTS
    ================================================= */}

    {!loading &&
      requests.length > 0 && (

      <section className="provider-requests-section">


        <div className="provider-requests-section-header">

          <div>

            <span>
              SOLICITAÇÕES
            </span>

            <h2>
              Seus pedidos
            </h2>

          </div>


          <div className="provider-requests-count">

            {requests.length}

            {requests.length === 1
              ? " pedido"
              : " pedidos"}

          </div>

        </div>


        <div className="provider-requests-list">


          {requests.map((request) => (

            <article
              key={request.id}
              className="provider-request-card"
            >


              <div className="provider-request-main">


                <div className="provider-request-icon">
                  🔧
                </div>


                <div className="provider-request-content">


                  <div className="provider-request-top">

                    <h3>
                      {request.service_title ||
                        request.title ||
                        "Pedido de serviço"}
                    </h3>


                    <span
                      className={
                        `provider-request-status ${
                          getStatusClass(
                            request.status
                          )
                        }`
                      }
                    >

                      {getStatusLabel(
                        request.status
                      )}

                    </span>

                  </div>


                  {request.description && (

                    <p className="provider-request-description">
                      {request.description}
                    </p>

                  )}


                  <div className="provider-request-meta">


                    <div>

                      <span>
                        👤 Cliente
                      </span>

                      <strong>
                        {request.client_name ||
                          request.client?.name ||
                          "Cliente"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        💰 Valor
                      </span>

                      <strong>
                        {formatPrice(
                          request.budget ??
                          request.price
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        📅 Data
                      </span>

                      <strong>
                        {formatDate(
                          request.created_at
                        )}
                      </strong>

                    </div>


                  </div>


                </div>


              </div>


            </article>

          ))}


        </div>


      </section>

    )}


  </main>

</div>


);

}

export default ProviderRequests;
