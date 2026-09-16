
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import NotificationBell from "../components/NotificationBell";

import {
  getProviderRequests,
  getServices,
  getMyProviderProfile,
  getProviderReviews,
  getOpenProjects,
  updateRequestStatus
} from "../api/provider";

import "./ProviderDashboard.css";


function ProviderDashboard() {

  const { user, logout } = useAuth();

  function handleClientMode() {
    window.location.href = "/client";
  }

  const [requests, setRequests] = useState([]);
  const [openProjects, setOpenProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRequest, setUpdatingRequest] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);
        setError("");

        const [
          requestsData,
          servicesData,
          providerProfile,
          openProjectsData
        ] = await Promise.all([
          getProviderRequests(),
          getServices(),
          getMyProviderProfile(),
          getOpenProjects()
        ]);

        const reviewsData =
          await getProviderReviews(
            providerProfile.id
          );

        setRequests(requestsData);
        setServices(servicesData);
        setReviews(reviewsData);
        setOpenProjects(openProjectsData);

      } catch (error) {

        console.error(
          "Erro ao carregar dashboard:",
          error
        );

        setError(
          error.message ||
          "Erro ao carregar os dados."
        );

      } finally {

        setLoading(false);

      }

    }

    loadDashboard();

  }, []);


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


  const closeMenu = () => {
    setMenuOpen(false);
  };


  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };


  const completedRequests =
    requests.filter(
      request =>
        request.status === "COMPLETED"
    );


  const inProgressRequests =
    requests.filter(
      request =>
        request.status === "IN_PROGRESS"
    );


  async function handleRequestStatus(
    requestId,
    status
  ) {

    try {

      setUpdatingRequest(requestId);
      setError("");

      const result =
        await updateRequestStatus(
          requestId,
          status
        );

      console.log(
        "Status atualizado:",
        result
      );

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: status
              }
            : request
        )
      );

    } catch (error) {

      console.error(
        "Erro ao atualizar pedido:",
        error
      );

      setError(
        error.message ||
        "Erro ao atualizar o pedido."
      );

    } finally {

      setUpdatingRequest(null);

    }

  }


  function getInitials(name) {

    if (!name) {
      return "P";
    }

    const parts =
      name.trim().split(" ");

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


  function getStatusLabel(status) {

    const labels = {
      PENDING: "Pendente",
      ACCEPTED: "Aceito",
      IN_PROGRESS: "Em andamento",
      COMPLETED: "Concluído",
      REJECTED: "Rejeitado",
      CANCELLED: "Cancelado"
    };

    return labels[status] || status;

  }


  return (

    <div className="provider-dashboard-page">


      {/* =========================================
          HEADER MOBILE
      ========================================= */}

      <header className="provider-mobile-header">

        <button
          className="provider-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>


        <div className="provider-mobile-logo">
          Mão<span>NaObra</span>
        </div>


        <div className="provider-mobile-notification">
          <NotificationBell />
        </div>

      </header>


      {/* =========================================
          OVERLAY
      ========================================= */}

      {menuOpen && (

        <div
          className="provider-sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />

      )}


      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={
          `provider-sidebar ${
            menuOpen
              ? "provider-sidebar-open"
              : ""
          }`
        }
      >

        <button
          className="provider-sidebar-close"
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          ×
        </button>


        {/* LOGO */}

        <div className="provider-sidebar-brand">

          <div className="provider-brand-mark">
            M
          </div>

          <div>

            <div className="provider-brand-name">
              Mão<span>NaObra</span>
            </div>

            <div className="provider-brand-area">
              Área profissional
            </div>

          </div>

        </div>


        {/* IDENTIDADE DO PRESTADOR */}

        <div className="provider-area-badge">

          <div className="provider-area-icon">
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


        {/* NAVEGAÇÃO */}

        <div className="provider-nav-title">
          MENU PRINCIPAL
        </div>


        <nav className="provider-sidebar-nav">

          <a
            href="/provider"
            onClick={closeMenu}
            className="provider-nav-link active"
          >
            <span className="provider-nav-icon">
              ◈
            </span>

            <span>
              Visão geral
            </span>
          </a>


          <a
            href="/provider/services"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              🔧
            </span>

            <span>
              Meus serviços
            </span>
          </a>


          <a
            href="/provider/services/new"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ＋
            </span>

            <span>
              Criar serviço
            </span>
          </a>


          <a
            href="/provider/requests"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ▣
            </span>

            <span>
              Pedidos recebidos
            </span>

            {requests.length > 0 && (
              <span className="provider-nav-count">
                {requests.length}
              </span>
            )}

          </a>


          <a
            href="/provider/projects"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ◉
            </span>

            <span>
              Projetos disponíveis
            </span>
          </a>


          <a
            href="/provider/chat"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ◌
            </span>

            <span>
              Mensagens
            </span>
          </a>


          <a
            href="/provider/reviews"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ★
            </span>

            <span>
              Avaliações
            </span>
          </a>


          <div className="provider-nav-divider"></div>


          <div className="provider-nav-title">
            CONTA
          </div>


          <a
            href="/provider/profile"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ○
            </span>

            <span>
              Meu perfil
            </span>
          </a>


          <a
            href="/"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ⌂
            </span>

            <span>
              Página inicial
            </span>
          </a>

        </nav>


        {/* PARTE INFERIOR */}

        <div className="provider-sidebar-bottom">


          {/* MUDAR PARA CLIENTE */}

          <button
            type="button"
            className="provider-client-mode"
            onClick={handleClientMode}
          >

            <span className="provider-client-mode-icon">
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

            <span className="provider-client-arrow">
              →
            </span>

          </button>


          {/* UTILIZADOR */}

          <div className="provider-sidebar-user">

            <div className="provider-user-avatar">
              {getInitials(user?.name)}
            </div>

            <div className="provider-user-info">

              <strong>
                {user?.name || "Prestador"}
              </strong>

              <span>
                Prestador
              </span>

            </div>

          </div>


          <button
            onClick={handleLogout}
            className="provider-logout"
          >

            <span>
              ↪
            </span>

            Sair da conta

          </button>

        </div>

      </aside>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="provider-main">


        {/* =====================================
            HEADER
        ===================================== */}

        <header className="provider-topbar">

          <div className="provider-page-heading">

            <div className="provider-heading-label">
              <span className="provider-heading-dot"></span>
              PAINEL PROFISSIONAL
            </div>

            <h1>
              Olá, {user?.name || "Prestador"} 👋
            </h1>

            <p>
              Gerencie seus serviços, pedidos e
              encontre novas oportunidades.
            </p>

          </div>


          <div className="provider-header-actions">

            <NotificationBell />


            <button
              type="button"
              className="provider-header-client-btn"
              onClick={handleClientMode}
            >
              👤
              <span>
                Área do Cliente
              </span>
            </button>


            <a
              href="/provider/services/new"
              className="provider-create-btn"
            >
              <span>＋</span>
              Criar serviço
            </a>

          </div>

        </header>


        {/* =====================================
            ERRO
        ===================================== */}

        {error && (

          <div className="provider-error-message">

            <span>
              !
            </span>

            {error}

          </div>

        )}


        {/* =====================================
            LOADING
        ===================================== */}

        {loading ? (

          <div className="provider-loading">

            <div className="provider-spinner"></div>

            <h3>
              Preparando o seu painel...
            </h3>

            <p>
              Estamos a carregar os seus dados.
            </p>

          </div>

        ) : (

          <>


            {/* =====================================
                WELCOME / OPPORTUNITY HERO
            ===================================== */}

            <section className="provider-welcome-card">

              <div className="provider-welcome-content">

                <div className="provider-welcome-eyebrow">
                  <span>✦</span>
                  OPORTUNIDADES PARA SI
                </div>

                <h2>
                  Transforme suas habilidades
                  em novas oportunidades.
                </h2>

                <p>
                  Publique os seus serviços, encontre
                  projetos e conecte-se com clientes
                  que precisam do seu trabalho.
                </p>

                <div className="provider-welcome-actions">

                  <a
                    href="/provider/projects"
                    className="provider-welcome-primary"
                  >
                    Explorar projetos
                    <span>→</span>
                  </a>

                  <a
                    href="/provider/services/new"
                    className="provider-welcome-secondary"
                  >
                    Criar serviço
                  </a>

                </div>

              </div>


              <div className="provider-welcome-decoration">

                <div className="provider-welcome-ring">
                  🛠️
                </div>

                <div className="provider-welcome-floating-card">
                  <strong>
                    {openProjects.length}
                  </strong>

                  <span>
                    projetos disponíveis
                  </span>
                </div>

              </div>

            </section>


            {/* =====================================
                ESTATÍSTICAS
            ===================================== */}

            <section className="provider-stats-grid">


              <div className="provider-stat-card">

                <div className="provider-stat-icon orange">
                  🔧
                </div>

                <div className="provider-stat-content">

                  <span>
                    SERVIÇOS
                  </span>

                  <strong>
                    {services.length}
                  </strong>

                  <small>
                    Serviços publicados
                  </small>

                </div>

              </div>


              <div className="provider-stat-card">

                <div className="provider-stat-icon blue">
                  ▣
                </div>

                <div className="provider-stat-content">

                  <span>
                    PEDIDOS
                  </span>

                  <strong>
                    {requests.length}
                  </strong>

                  <small>
                    Pedidos recebidos
                  </small>

                </div>

              </div>


              <div className="provider-stat-card">

                <div className="provider-stat-icon purple">
                  ◌
                </div>

                <div className="provider-stat-content">

                  <span>
                    EM ANDAMENTO
                  </span>

                  <strong>
                    {inProgressRequests.length}
                  </strong>

                  <small>
                    Trabalhos ativos
                  </small>

                </div>

              </div>


              <div className="provider-stat-card">

                <div className="provider-stat-icon green">
                  ✓
                </div>

                <div className="provider-stat-content">

                  <span>
                    CONCLUÍDOS
                  </span>

                  <strong>
                    {completedRequests.length}
                  </strong>

                  <small>
                    Trabalhos concluídos
                  </small>

                </div>

              </div>


              <div className="provider-stat-card">

                <div className="provider-stat-icon gold">
                  ★
                </div>

                <div className="provider-stat-content">

                  <span>
                    AVALIAÇÃO
                  </span>

                  <strong>
                    {reviews?.average_rating ?? 0}
                  </strong>

                  <small>
                    Média dos clientes
                  </small>

                </div>

              </div>


            </section>


            {/* =====================================
                PROJETOS DISPONÍVEIS
            ===================================== */}

            <section className="provider-section">


              <div className="provider-section-header">

                <div>

                  <div className="provider-section-kicker">
                    OPORTUNIDADES
                  </div>

                  <h2>
                    Projetos disponíveis
                  </h2>

                  <p>
                    Encontre projetos de clientes
                    e envie suas propostas.
                  </p>

                </div>


                <a
                  href="/provider/projects"
                  className="provider-section-link"
                >
                  Ver todos
                  <span>→</span>
                </a>

              </div>


              {openProjects.length === 0 ? (

                <div className="provider-empty-state">

                  <div className="provider-empty-icon">
                    ◉
                  </div>

                  <h3>
                    Nenhum projeto disponível
                  </h3>

                  <p>
                    Quando clientes publicarem novos
                    projetos, eles aparecerão aqui.
                  </p>

                </div>

              ) : (

                <div className="provider-project-list">

                  {openProjects
                    .slice(0, 5)
                    .map((project) => (

                      <article
                        className="provider-project-card"
                        key={project.id}
                      >

                        <div className="provider-project-icon">
                          ◉
                        </div>


                        <div className="provider-project-info">

                          <div className="provider-project-top">

                            <span className="provider-open-label">
                              ABERTO
                            </span>

                            <span className="provider-project-category">
                              {project.category}
                            </span>

                          </div>

                          <h3>
                            {project.title}
                          </h3>

                          <p>
                            {project.description}
                          </p>


                          <div className="provider-project-meta">

                            <span>
                              📍 {project.location}
                            </span>

                            <span>
                              💰{" "}
                              {project.budget !== null &&
                              project.budget !== undefined
                                ? `${project.budget} MT`
                                : "Orçamento não definido"}
                            </span>

                          </div>

                        </div>


                        <div className="provider-project-action">

                          <a
                            href={`/provider/projects/${project.id}`}
                            className="provider-view-project"
                          >
                            Ver projeto
                            <span>→</span>
                          </a>

                        </div>

                      </article>

                    ))}

                </div>

              )}

            </section>


            {/* =====================================
                PEDIDOS RECENTES
            ===================================== */}

            <section className="provider-section">


              <div className="provider-section-header">

                <div>

                  <div className="provider-section-kicker">
                    CLIENTES
                  </div>

                  <h2>
                    Pedidos recentes
                  </h2>

                  <p>
                    Solicitações recebidas dos clientes.
                  </p>

                </div>


                <a
                  href="/provider/requests"
                  className="provider-section-link"
                >
                  Ver todos
                  <span>→</span>
                </a>

              </div>


              {requests.length === 0 ? (

                <div className="provider-empty-state">

                  <div className="provider-empty-icon">
                    ▣
                  </div>

                  <h3>
                    Nenhum pedido recebido
                  </h3>

                  <p>
                    Quando clientes solicitarem
                    seus serviços, eles aparecerão aqui.
                  </p>

                </div>

              ) : (

                <div className="provider-request-list">

                  {requests
                    .slice(0, 5)
                    .map((request) => (

                      <article
                        className="provider-request-card"
                        key={request.id}
                      >

                        <div className="provider-request-client">

                          <div className="provider-client-avatar">
                            {getInitials(
                              request.client?.name
                            )}
                          </div>

                          <div>

                            <h3>
                              {request.service?.title}
                            </h3>

                            <p>
                              Cliente:{" "}
                              {request.client?.name}
                            </p>

                          </div>

                        </div>


                        <div className="provider-request-details">

                          <span>
                            📍 {request.location}
                          </span>

                          <strong>
                            💰 {request.agreed_price} MT
                          </strong>

                        </div>


                        <div className="provider-request-actions">

                          <span
                            className={
                              `provider-status-badge status-${request.status?.toLowerCase()}`
                            }
                          >
                            {getStatusLabel(request.status)}
                          </span>


                          {request.status === "PENDING" && (

                            <div className="provider-action-buttons">

                              <button
                                className="provider-accept-btn"
                                disabled={
                                  updatingRequest === request.id
                                }
                                onClick={() =>
                                  handleRequestStatus(
                                    request.id,
                                    "ACCEPTED"
                                  )
                                }
                              >
                                {updatingRequest === request.id
                                  ? "..."
                                  : "✓ Aceitar"}
                              </button>


                              <button
                                type="button"
                                className="provider-reject-btn"
                                disabled={
                                  updatingRequest === request.id
                                }
                                onClick={() =>
                                  handleRequestStatus(
                                    request.id,
                                    "REJECTED"
                                  )
                                }
                              >
                                Rejeitar
                              </button>

                            </div>

                          )}


                          {request.status === "ACCEPTED" && (

                            <button
                              className="provider-primary-action"
                              disabled={
                                updatingRequest === request.id
                              }
                              onClick={() =>
                                handleRequestStatus(
                                  request.id,
                                  "IN_PROGRESS"
                                )
                              }
                            >
                              {updatingRequest === request.id
                                ? "Atualizando..."
                                : "↻ Iniciar serviço"}
                            </button>

                          )}


                          {request.status === "IN_PROGRESS" && (

                            <button
                              className="provider-primary-action"
                              disabled={
                                updatingRequest === request.id
                              }
                              onClick={() =>
                                handleRequestStatus(
                                  request.id,
                                  "COMPLETED"
                                )
                              }
                            >
                              {updatingRequest === request.id
                                ? "Atualizando..."
                                : "✓ Concluir serviço"}
                            </button>

                          )}

                        </div>

                      </article>

                    ))}

                </div>

              )}

            </section>


            {/* =====================================
                SERVIÇOS
            ===================================== */}

            <section className="provider-section">


              <div className="provider-section-header">

                <div>

                  <div className="provider-section-kicker">
                    O SEU NEGÓCIO
                  </div>

                  <h2>
                    Meus serviços
                  </h2>

                  <p>
                    Serviços que você disponibiliza
                    aos clientes.
                  </p>

                </div>


                <a
                  href="/provider/services"
                  className="provider-section-link"
                >
                  Ver todos
                  <span>→</span>
                </a>

              </div>


              {services.length === 0 ? (

                <div className="provider-empty-state">

                  <div className="provider-empty-icon">
                    🔧
                  </div>

                  <h3>
                    Nenhum serviço encontrado
                  </h3>

                  <p>
                    Crie seu primeiro serviço e comece
                    a receber pedidos.
                  </p>

                  <a
                    href="/provider/services/new"
                    className="provider-empty-action"
                  >
                    Criar serviço
                    <span>→</span>
                  </a>

                </div>

              ) : (

                <div className="provider-service-grid">

                  {services
                    .slice(0, 6)
                    .map((service) => (

                      <article
                        className="provider-service-card"
                        key={service.id}
                      >

                        <div className="provider-service-card-top">

                          <div className="provider-service-icon">
                            🔧
                          </div>

                          <span className="provider-service-active">
                            Ativo
                          </span>

                        </div>


                        <h3>
                          {service.title}
                        </h3>


                        <p>
                          {service.description}
                        </p>


                        <div className="provider-service-bottom">

                          <strong>
                            {service.price} MT
                          </strong>

                          <span>
                            por serviço
                          </span>

                        </div>


                        <div className="provider-service-meta">

                          <span>
                            {service.category?.name}
                          </span>

                          <span>
                            {service.provider?.location}
                          </span>

                        </div>

                      </article>

                    ))}

                </div>

              )}

            </section>


            {/* =====================================
                AVALIAÇÕES
            ===================================== */}

            <section className="provider-section">


              <div className="provider-section-header">

                <div>

                  <div className="provider-section-kicker">
                    REPUTAÇÃO
                  </div>

                  <h2>
                    Avaliações dos clientes
                  </h2>

                  <p>
                    Veja como os clientes avaliam
                    o seu trabalho.
                  </p>

                </div>


                {reviews &&
                reviews.total_reviews > 0 && (

                  <a
                    href="/provider/reviews"
                    className="provider-section-link"
                  >
                    Ver todas
                    <span>→</span>
                  </a>

                )}

              </div>


              {!reviews ||
              reviews.total_reviews === 0 ? (

                <div className="provider-empty-state">

                  <div className="provider-empty-icon">
                    ★
                  </div>

                  <h3>
                    Ainda não possui avaliações
                  </h3>

                  <p>
                    Quando um cliente avaliar
                    o seu trabalho, a avaliação
                    aparecerá aqui.
                  </p>

                </div>

              ) : (

                <div className="provider-reviews-summary">


                  <div className="provider-rating-box">

                    <span className="provider-rating-label">
                      AVALIAÇÃO MÉDIA
                    </span>

                    <strong>
                      {reviews.average_rating}
                    </strong>


                    <div className="provider-stars">

                      {"★".repeat(
                        Math.round(
                          reviews.average_rating
                        )
                      )}

                      {"☆".repeat(
                        5 -
                        Math.round(
                          reviews.average_rating
                        )
                      )}

                    </div>


                    <span className="provider-review-count">

                      {reviews.total_reviews}{" "}

                      {reviews.total_reviews === 1
                        ? "avaliação"
                        : "avaliações"}

                    </span>

                  </div>


                  <div className="provider-latest-review">

                    <div className="provider-review-heading">

                      <div className="provider-review-client-avatar">
                        {getInitials(
                          reviews.reviews?.[0]?.client?.name
                        )}
                      </div>

                      <div>

                        <strong>
                          {
                            reviews
                              .reviews?.[0]
                              ?.client?.name
                          }
                        </strong>

                        <div className="provider-stars small">

                          {"★".repeat(
                            reviews
                              .reviews?.[0]
                              ?.rating || 0
                          )}

                        </div>

                      </div>

                    </div>


                    <p>
                      {reviews
                        .reviews?.[0]
                        ?.comment
                        ? `"${reviews.reviews[0].comment}"`
                        : "Cliente não deixou comentário."}
                    </p>

                  </div>

                </div>

              )}

            </section>


          </>

        )}

      </main>

    </div>

  );

}


export default ProviderDashboard;

