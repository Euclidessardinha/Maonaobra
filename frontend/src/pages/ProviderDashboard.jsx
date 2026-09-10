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


function ProviderDashboard() {

  const { user, logout } = useAuth();

  const [requests, setRequests] = useState([]);

  const [openProjects, setOpenProjects] = useState([]);

  const [services, setServices] = useState([]);

  const [reviews, setReviews] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingRequest, setUpdatingRequest] = useState(null);

  // Menu mobile
  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);

        setError("");

        /*
         * Primeiro buscamos:
         * - pedidos
         * - serviços
         * - perfil profissional
         */

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


        /*
         * Agora que temos o ID correto
         * do ProviderProfile, buscamos
         * as avaliações.
         */

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


  /*
   * Fechar menu com ESC
   */

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


  /*
   * Bloquear scroll quando o menu
   * mobile estiver aberto
   */

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


  async function handleRequestStatus(requestId, status) {

    try {

      setUpdatingRequest(requestId);

      setError("");

      const result = await updateRequestStatus(
        requestId,
        status
      );


      console.log(
        "Status atualizado:",
        result
      );


      // Atualizar o pedido na lista

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


  return (

    <div className="dashboard provider-dashboard">


      {/* =========================================
          HEADER MOBILE
      ========================================= */}

      <header className="mobile-dashboard-header">

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>


        <div className="mobile-dashboard-logo">

          Mão<span>NaObra</span>

        </div>


        {/* Espaço para manter o logo centralizado */}

        <div className="mobile-dashboard-notification">
          <NotificationBell />
        </div>

      </header>


      {/* =========================================
          OVERLAY
      ========================================= */}

      {menuOpen && (

        <div
          className="sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />

      )}


      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-open" : ""
        }`}
      >


        {/* BOTÃO FECHAR MOBILE */}

        <button
          className="sidebar-close"
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          ✕
        </button>


        <div className="logo">
          Mão<span>NaObra</span>
        </div>


        <nav>


          <a
            href="/provider"
            onClick={closeMenu}
            className="active"
          >
            🏠 Visão geral
          </a>


          <a
            href="/provider/services"
            onClick={closeMenu}
          >
            🔧 Meus serviços
          </a>


          <a
            href="/provider/services/new"
            onClick={closeMenu}
          >
            ➕ Criar serviço
          </a>


          <a
            href="/provider/requests"
            onClick={closeMenu}
          >
            📋 Pedidos recebidos
          </a>


          <a
            href="/provider/chat"
            onClick={closeMenu}
          >
            💬 Mensagens
          </a>


          <a
            href="/provider/profile"
            onClick={closeMenu}
          >
            👤 Meu perfil
          </a>


        </nav>


        <button
          onClick={handleLogout}
          className="sidebar-logout"
        >
          Sair
        </button>


      </aside>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="dashboard-content">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="dashboard-header provider-dashboard-header">


          <div>

            <span className="section-label">
              ÁREA DO PRESTADOR
            </span>


            <h1>
              Olá, {user?.name} 👋
            </h1>


            <p>
              Gerencie seus serviços e pedidos.
            </p>

          </div>


          {/* AÇÕES DO HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px"
            }}
          >

            <NotificationBell />


            <a
              href="/provider/services/new"
              className="register-btn"
            >
              + Criar serviço
            </a>

          </div>


        </div>


        {/* =====================================
            ERRO
        ===================================== */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* =====================================
            LOADING
        ===================================== */}

        {loading ? (

          <div className="empty-state">

            <h3>
              Carregando seus dados...
            </h3>

          </div>

        ) : (

          <>


            {/* =====================================
                ESTATÍSTICAS
            ===================================== */}

            <div className="stats-grid">


              {/* SERVIÇOS */}

              <div className="stat-card">

                <span>🔧</span>

                <h2>
                  {services.length}
                </h2>

                <p>
                  Serviços
                </p>

              </div>


              {/* PEDIDOS */}

              <div className="stat-card">

                <span>📋</span>

                <h2>
                  {requests.length}
                </h2>

                <p>
                  Pedidos recebidos
                </p>

              </div>


              {/* EM ANDAMENTO */}

              <div className="stat-card">

                <span>🔄</span>

                <h2>
                  {inProgressRequests.length}
                </h2>

                <p>
                  Em andamento
                </p>

              </div>


              {/* CONCLUÍDOS */}

              <div className="stat-card">

                <span>✅</span>

                <h2>
                  {completedRequests.length}
                </h2>

                <p>
                  Concluídos
                </p>

              </div>


              {/* AVALIAÇÃO */}

              <div className="stat-card">

                <span>⭐</span>

                <h2>
                  {reviews?.average_rating ?? 0}
                </h2>

                <p>
                  Avaliação média
                </p>

              </div>


            </div>


            {/* =====================================
                PROJETOS DISPONÍVEIS
            ===================================== */}

            <section className="dashboard-section">


              <div className="section-header">

                <div>

                  <h2>
                    Projetos disponíveis
                  </h2>

                  <p>
                    Encontre projetos de clientes
                    e envie suas propostas.
                  </p>

                </div>

              </div>


              {openProjects.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    🔎
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

                <div className="request-list">

                  {openProjects
                    .slice(0, 5)
                    .map((project) => (

                      <div
                        className="request-card"
                        key={project.id}
                      >

                        <div>

                          <h3>
                            {project.title}
                          </h3>

                          <p>
                            {project.description}
                          </p>

                          <p>
                            📂 {project.category}
                          </p>

                          <p>
                            📍 {project.location}
                          </p>

                          <p>
                            💰{" "}

                            {project.budget !== null &&
                            project.budget !== undefined

                              ? `${project.budget} MT`

                              : "Orçamento não definido"}

                          </p>

                        </div>


                        <div>

                          <span className="status-badge status-open">
                            ABERTO
                          </span>

                          <br />


                          <a
                            href={`/provider/projects/${project.id}`}
                            className="register-btn"
                            style={{
                              marginTop: "10px",
                              display: "inline-block"
                            }}
                          >
                            Ver projeto
                          </a>

                        </div>


                      </div>

                    ))}

                </div>

              )}

            </section>


            {/* =====================================
                PEDIDOS
            ===================================== */}

            <section className="dashboard-section">


              <div className="section-header">

                <div>

                  <h2>
                    Pedidos recentes
                  </h2>

                  <p>
                    Solicitações recebidas
                    dos clientes.
                  </p>

                </div>


                <a href="/provider/requests">
                  Ver todos →
                </a>

              </div>


              {requests.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    📋
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

                <div className="request-list">

                  {requests
                    .slice(0, 5)
                    .map((request) => (

                      <div
                        className="request-card"
                        key={request.id}
                      >

                        <div>

                          <h3>
                            {request.service?.title}
                          </h3>

                          <p>
                            Cliente:{" "}
                            {request.client?.name}
                          </p>

                          <p>
                            📍 {request.location}
                          </p>

                          <p>
                            💰{" "}
                            {request.agreed_price} MT
                          </p>

                        </div>


                        <div>

                          <span
                            className={
                              `status-badge status-${request.status?.toLowerCase()}`
                            }
                          >
                            {request.status}
                          </span>


                          {request.status === "PENDING" && (

                            <div style={{ marginTop: "10px" }}>

                              <button
                                className="primary-button"
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
                                  ? "Atualizando..."
                                  : "✅ Aceitar"}
                              </button>


                              <button
                                type="button"
                                disabled={
                                  updatingRequest === request.id
                                }
                                onClick={() =>
                                  handleRequestStatus(
                                    request.id,
                                    "REJECTED"
                                  )
                                }
                                style={{
                                  marginLeft: "8px"
                                }}
                              >
                                ❌ Rejeitar
                              </button>

                            </div>

                          )}


                          {request.status === "ACCEPTED" && (

                            <button
                              className="primary-button"
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
                                : "🔄 Iniciar serviço"}
                            </button>

                          )}


                          {request.status === "IN_PROGRESS" && (

                            <button
                              className="primary-button"
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
                                : "✅ Concluir serviço"}
                            </button>

                          )}

                        </div>

                      </div>

                    ))}

                </div>

              )}

            </section>


            {/* =====================================
                SERVIÇOS
            ===================================== */}

            <section className="dashboard-section">


              <div className="section-header">

                <div>

                  <h2>
                    Serviços
                  </h2>

                  <p>
                    Serviços cadastrados na plataforma.
                  </p>

                </div>


                <a href="/provider/services">
                  Ver todos →
                </a>

              </div>


              {services.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    🔧
                  </div>

                  <h3>
                    Nenhum serviço encontrado
                  </h3>

                  <p>
                    Crie seu primeiro serviço.
                  </p>


                  <a
                    href="/provider/services/new"
                    className="register-btn"
                  >
                    Criar serviço
                  </a>

                </div>

              ) : (

                <div className="service-grid">

                  {services
                    .slice(0, 6)
                    .map((service) => (

                      <div
                        className="service-card"
                        key={service.id}
                      >

                        <div className="service-icon">
                          🔧
                        </div>


                        <h3>
                          {service.title}
                        </h3>


                        <p>
                          {service.description}
                        </p>


                        <strong>
                          {service.price} MT
                        </strong>


                        <div className="service-meta">

                          <span>
                            {service.category?.name}
                          </span>

                          <span>
                            {service.provider?.location}
                          </span>

                        </div>

                      </div>

                    ))}

                </div>

              )}

            </section>


            {/* =====================================
                AVALIAÇÕES
            ===================================== */}

            <section className="dashboard-section">


              <div className="section-header">

                <div>

                  <h2>
                    Avaliações dos clientes
                  </h2>

                  <p>
                    Veja a reputação do seu trabalho.
                  </p>

                </div>


                {reviews &&
                reviews.total_reviews > 0 && (

                  <a href="/provider/reviews">
                    Ver todas →
                  </a>

                )}

              </div>


              {!reviews ||
              reviews.total_reviews === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    ⭐
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

                <div className="reviews-dashboard-summary">


                  <div className="rating-average">

                    <strong>
                      {reviews.average_rating}
                    </strong>


                    <div className="stars">

                      {"⭐".repeat(
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


                    <span>

                      {reviews.total_reviews}{" "}

                      {reviews.total_reviews === 1
                        ? "avaliação"
                        : "avaliações"}

                    </span>

                  </div>


                  <div className="latest-review">

                    {reviews.reviews?.[0] && (

                      <>

                        <div className="latest-review-header">

                          <strong>
                            {
                              reviews
                                .reviews[0]
                                .client?.name
                            }
                          </strong>


                          <span className="stars">

                            {"⭐".repeat(
                              reviews
                                .reviews[0]
                                .rating
                            )}

                          </span>

                        </div>


                        {reviews
                          .reviews[0]
                          .comment ? (

                          <p>
                            "{reviews
                              .reviews[0]
                              .comment}"
                          </p>

                        ) : (

                          <p>
                            Cliente não deixou comentário.
                          </p>

                        )}

                      </>

                    )}

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