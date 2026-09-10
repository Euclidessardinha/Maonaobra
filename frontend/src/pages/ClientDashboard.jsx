import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getMyProjects } from "../api/projects";
import NotificationBell from "../components/NotificationBell";

function ClientDashboard() {

  const {
    user,
    logout
  } = useAuth();


  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado do menu mobile
  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {

    async function loadProjects() {

      try {

        setLoading(true);

        const data = await getMyProjects();

        setProjects(data);

      } catch (error) {

        console.error(error);

        setError(
          error.message ||
          "Erro ao carregar seus projetos."
        );

      } finally {

        setLoading(false);

      }

    }

    loadProjects();

  }, []);


  // Fechar menu ao pressionar ESC
  useEffect(() => {

    function handleEscape(event) {

      if (event.key === "Escape") {
        setMenuOpen(false);
      }

    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };

  }, []);


  // Impedir scroll do body quando menu estiver aberto
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


  const inProgressProjects =
    projects.filter(
      project =>
        project.status === "IN_PROGRESS"
    );


  const completedProjects =
    projects.filter(
      project =>
        project.status === "COMPLETED"
    );


  const closeMenu = () => {
    setMenuOpen(false);
  };


  const handleLogout = () => {

    setMenuOpen(false);

    logout();

  };


  return (

    <div className="dashboard client-dashboard">


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


        <div className="mobile-dashboard-notification">
          <NotificationBell />
        </div>

      </header>


      {/* =========================================
          OVERLAY MOBILE
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

        {/* BOTÃO FECHAR - MOBILE */}

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
            href="/client"
            onClick={closeMenu}
            className="active"
          >
            🏠 Visão geral
          </a>


          <a
            href="/client/requests"
            onClick={closeMenu}
          >
            📋 Meus pedidos
          </a>


          <a
            href="/client/favorites"
            onClick={closeMenu}
          >
            ❤️ Favoritos
          </a>


          <a
            href="/client/reviews"
            onClick={closeMenu}
          >
            ⭐ Avaliações
          </a>


          <a
            href="/client/profile"
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
          CONTEÚDO PRINCIPAL
      ========================================= */}

      <main className="dashboard-content">


        {/* HEADER */}

        <div className="dashboard-header client-dashboard-header">

          <div>

            <span className="section-label">
              ÁREA DO CLIENTE
            </span>


            <h1>
              Olá, {user?.name} 👋
            </h1>


            <p>
              Encontre profissionais para
              realizar seus serviços.
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

            {/* SINO DE NOTIFICAÇÕES */}

            <NotificationBell />


            {/* PROCURAR SERVIÇO */}

            <a
              href="/services"
              className="register-btn"
            >
              Procurar serviço
            </a>

          </div>

        </div>


        {/* ERRO */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* LOADING */}

        {loading ? (

          <div className="empty-state">

            <h3>
              Carregando seus projetos...
            </h3>

          </div>

        ) : (

          <>


            {/* =====================================
                ESTATÍSTICAS
            ===================================== */}

            <div className="stats-grid">


              {/* PEDIDOS */}

              <div className="stat-card">

                <span>📋</span>

                <h2>
                  {projects.length}
                </h2>

                <p>
                  Pedidos
                </p>

              </div>


              {/* EM ANDAMENTO */}

              <div className="stat-card">

                <span>🔄</span>

                <h2>
                  {inProgressProjects.length}
                </h2>

                <p>
                  Em andamento
                </p>

              </div>


              {/* CONCLUÍDOS */}

              <div className="stat-card">

                <span>✅</span>

                <h2>
                  {completedProjects.length}
                </h2>

                <p>
                  Concluídos
                </p>

              </div>


              {/* FAVORITOS */}

              <div className="stat-card">

                <span>❤️</span>

                <h2>
                  0
                </h2>

                <p>
                  Favoritos
                </p>

              </div>


            </div>


            {/* =====================================
                PEDIDOS RECENTES
            ===================================== */}

            <section className="dashboard-section">


              <div className="section-header">

                <div>

                  <h2>
                    Seus pedidos recentes
                  </h2>

                  <p>
                    Acompanhe os serviços que
                    você solicitou.
                  </p>

                </div>


                <a href="/client/requests">
                  Ver todos →
                </a>

              </div>


              {/* SEM PROJETOS */}

              {projects.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    📋
                  </div>


                  <h3>
                    Você ainda não tem pedidos
                  </h3>


                  <p>
                    Publique um projeto e encontre
                    profissionais para realizar o serviço.
                  </p>


                  <a
                    href="/client/projects/new"
                    className="register-btn"
                  >
                    Publicar projeto
                  </a>

                </div>

              ) : (

                /* LISTA DE PROJETOS */

                <div className="request-list">

                  {projects
                    .slice(0, 5)
                    .map((project) => (

                      <div
                        className="request-card"
                        key={project.id}
                      >


                        {/* INFORMAÇÕES DO PROJETO */}

                        <div>

                          <h3>
                            {project.title}
                          </h3>


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


                        {/* STATUS E AÇÕES */}

                        <div className="project-card-actions">


                          <span
                            className={
                              `status-badge status-${project.status?.toLowerCase()}`
                            }
                          >
                            {project.status}
                          </span>


                          <a
                            href={`/client/projects/${project.id}`}
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


          </>

        )}

      </main>

    </div>

  );

}


export default ClientDashboard;