import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getMyProjects } from "../api/projects";
import { getMyProviderProfile } from "../api/provider";
import NotificationBell from "../components/NotificationBell";

import "./ClientDashboard.css";


function ClientDashboard() {

  const {
    user,
    logout
  } = useAuth();


  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const [switchingToProvider, setSwitchingToProvider] =
    useState(false);

  /*
   * Aba atualmente selecionada na área de projetos.
   *
   * OPEN          = Projetos abertos
   * IN_PROGRESS   = Em andamento
   * COMPLETED     = Concluídos
   */

  const [activeProjectTab, setActiveProjectTab] =
    useState("OPEN");


  /* =========================================================
     MUDAR PARA ÁREA DO PRESTADOR
  ========================================================= */

  async function handleProviderMode() {

    if (switchingToProvider) {
      return;
    }

    try {

      setSwitchingToProvider(true);

      /*
       * Verifica se o utilizador já possui
       * um perfil de prestador.
       *
       * Se existir:
       *    vai para o Dashboard do Prestador.
       *
       * Se não existir:
       *    vai para a página de criação do
       *    perfil de prestador.
       */

      await getMyProviderProfile();

      window.location.href = "/provider";

    } catch (error) {

      /*
       * O endpoint /providers/me retorna erro
       * quando o utilizador ainda não possui
       * um perfil de prestador.
       *
       * Nesse caso, encaminhamos para
       * a criação do perfil.
       */

      console.log(
        "Utilizador ainda não possui perfil de prestador.",
        error
      );

      window.location.href =
        "/provider/profile/create";

    } finally {

      setSwitchingToProvider(false);

    }
  }


  /* =========================================================
     CARREGAR PROJETOS
  ========================================================= */

  useEffect(() => {

    async function loadProjects() {

      try {

        setLoading(true);
        setError("");

        const data = await getMyProjects();

        setProjects(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Erro ao carregar projetos:",
          err
        );

        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Não foi possível carregar os seus projetos."
        );

      } finally {

        setLoading(false);

      }
    }

    loadProjects();

  }, []);


  /* =========================================================
     FECHAR MENU AO PRESSIONAR ESC
  ========================================================= */

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


  /* =========================================================
     BLOQUEAR SCROLL QUANDO MENU ESTIVER ABERTO
  ========================================================= */

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


  /* =========================================================
     FECHAR MENU
  ========================================================= */

  function closeMenu() {

    setMenuOpen(false);

  }


  /* =========================================================
     ESTATÍSTICAS
  ========================================================= */

  const totalProjects =
    projects.length;

  const openProjects =
    projects.filter(
      (project) =>
        project.status === "OPEN"
    ).length;

  const inProgressProjects =
    projects.filter(
      (project) =>
        project.status === "IN_PROGRESS"
    ).length;

  const completedProjects =
    projects.filter(
      (project) =>
        project.status === "COMPLETED"
    ).length;

  const favoriteCount =
    user?.favorite_count ||
    user?.favorites_count ||
    0;


  /* =========================================================
     PROJETOS DA ABA ATUAL
  ========================================================= */

  const filteredProjects =
    projects.filter(
      (project) =>
        project.status === activeProjectTab
    );


  /* =========================================================
     STATUS
  ========================================================= */

  function getStatusLabel(status) {

    switch (status) {

      case "IN_PROGRESS":
        return "Em andamento";

      case "COMPLETED":
        return "Concluído";

      case "CANCELLED":
        return "Cancelado";

      case "OPEN":
        return "Aberto";

      default:
        return status || "Pendente";

    }

  }


  function getStatusClass(status) {

    switch (status) {

      case "IN_PROGRESS":
        return "in-progress";

      case "COMPLETED":
        return "completed";

      case "CANCELLED":
        return "cancelled";

      case "OPEN":
        return "open";

      default:
        return "pending";

    }

  }


  /* =========================================================
     FORMATAR DATA
  ========================================================= */

  function formatDate(date) {

    if (!date) {

      return "";

    }

    try {

      return new Date(date).toLocaleDateString(
        "pt-MZ",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }
      );

    } catch {

      return "";

    }

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="client-dashboard-page">


      {/* =====================================================
          OVERLAY MOBILE
      ===================================================== */}

      {menuOpen && (

        <div
          className="client-dashboard-overlay"
          onClick={closeMenu}
        />

      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`client-dashboard-sidebar ${
          menuOpen
            ? "client-dashboard-sidebar-open"
            : ""
        }`}
      >


        {/* LOGO */}

        <div className="client-dashboard-logo">

          <img
            src="/favicon-mao4.png"
            alt="MãoNaObra"
          />

          <div>

            <strong>Mão</strong>

            <span>NaObra</span>

          </div>

        </div>


        {/* ÁREA */}

        <div className="client-dashboard-area-title">

          <span>
            👤
          </span>

          <strong>
            ÁREA DO CLIENTE
          </strong>

        </div>


        {/* MENU */}

        <nav className="client-dashboard-nav">


          <a
            href="/client"
            className="client-dashboard-nav-item active"
            onClick={closeMenu}
          >

            <span>
              🏠
            </span>

            <span>
              Dashboard
            </span>

          </a>


          <a
            href="/client/requests"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              📋
            </span>

            <span>
              Meus pedidos
            </span>

          </a>


          <a
            href="/client/providers"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              🔎
            </span>

            <span>
              Procurar profissionais
            </span>

          </a>


          <a
            href="/client/favorites"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              ❤️
            </span>

            <span>
              Favoritos
            </span>

          </a>


          <a
            href="/client/reviews"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              ⭐
            </span>

            <span>
              Avaliações
            </span>

          </a>


          <a
            href="/client/chat"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              💬
            </span>

            <span>
              Mensagens
            </span>

          </a>


          <a
            href="/client/notifications"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              🔔
            </span>

            <span>
              Notificações
            </span>

          </a>


          <a
            href="/client/profile"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              👤
            </span>

            <span>
              Meu perfil
            </span>

          </a>


        </nav>


        {/* =================================================
            PARTE INFERIOR
        ================================================= */}

        <div className="client-dashboard-sidebar-bottom">


          {/* MUDAR PARA PRESTADOR */}

          <button
            type="button"
            className="client-dashboard-mode-switch"
            onClick={() => {

              closeMenu();
              handleProviderMode();

            }}
            disabled={switchingToProvider}
          >

            <span>
              🛠️
            </span>

            <span>

              {switchingToProvider
                ? "A verificar..."
                : "Mudar para Prestador"}

            </span>

          </button>


          <a
            href="/"
            className="client-dashboard-nav-item"
            onClick={closeMenu}
          >

            <span>
              🌐
            </span>

            <span>
              Página inicial
            </span>

          </a>


          <button
            type="button"
            className="client-dashboard-logout"
            onClick={() => {

              closeMenu();
              logout();

            }}
          >

            <span>
              🚪
            </span>

            <span>
              Sair
            </span>

          </button>


        </div>


      </aside>


      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ===================================================== */}

      <main className="client-dashboard-main">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="client-dashboard-header">


          <div className="client-dashboard-header-left">


            <button
              type="button"
              className="client-dashboard-hamburger"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              aria-label="Abrir menu"
            >

              <span />
              <span />
              <span />

            </button>


            <div>

              <p className="client-dashboard-header-label">
                ÁREA DO CLIENTE
              </p>

              <h1>
                Olá, {user?.name || "Cliente"} 👋
              </h1>

            </div>


          </div>


          <div className="client-dashboard-header-actions">


            <NotificationBell />


            {/* =================================================
                BOTÃO PARA MUDAR PARA PRESTADOR
            ================================================= */}

            <button
              type="button"
              className="client-dashboard-mode-switch-header"
              onClick={handleProviderMode}
              disabled={switchingToProvider}
            >

              🛠️

              <span>
                {switchingToProvider
                  ? "A verificar..."
                  : "Mudar para Prestador"}
              </span>

            </button>


          </div>


        </header>


        {/* ===================================================
            CONTEÚDO
        =================================================== */}

        <section className="client-dashboard-content">


          {/* =================================================
              HERO
          ================================================= */}

          <div className="client-dashboard-welcome">


            <div>

              <span className="client-dashboard-welcome-label">
                PAINEL DO CLIENTE
              </span>

              <h2>
                Encontre profissionais para realizar seus serviços
              </h2>

              <p>
                Procure profissionais qualificados,
                envie pedidos e acompanhe os seus serviços
                num só lugar.
              </p>


              <div className="client-dashboard-welcome-actions">


                <button
                  type="button"
                  className="client-dashboard-primary-btn"
                  onClick={() => {

                    window.location.href =
                      "/client/providers";

                  }}
                >

                  🔎 Procurar profissionais

                </button>


                <button
                  type="button"
                  className="client-dashboard-secondary-btn"
                  onClick={() => {

                    window.location.href =
                      "/client/projects/new";

                  }}
                >

                  + Criar projeto

                </button>


              </div>


            </div>


            <div className="client-dashboard-welcome-icon">

              🛠️

            </div>


          </div>


          {/* =================================================
              ESTATÍSTICAS
          ================================================= */}

          <div className="client-dashboard-stats">


            <div className="client-dashboard-stat-card">

              <div className="client-dashboard-stat-icon">
                📋
              </div>

              <div>

                <span>
                  Pedidos
                </span>

                <strong>
                  {totalProjects}
                </strong>

              </div>

            </div>


            <div className="client-dashboard-stat-card">

              <div className="client-dashboard-stat-icon">
                🔄
              </div>

              <div>

                <span>
                  Em andamento
                </span>

                <strong>
                  {inProgressProjects}
                </strong>

              </div>

            </div>


            <div className="client-dashboard-stat-card">

              <div className="client-dashboard-stat-icon">
                ✅
              </div>

              <div>

                <span>
                  Concluídos
                </span>

                <strong>
                  {completedProjects}
                </strong>

              </div>

            </div>


            <div className="client-dashboard-stat-card">

              <div className="client-dashboard-stat-icon">
                ❤️
              </div>

              <div>

                <span>
                  Favoritos
                </span>

                <strong>
                  {favoriteCount}
                </strong>

              </div>

            </div>


          </div>


          {/* =================================================
              PROJETOS
          ================================================= */}

          <section className="client-dashboard-section">


            <div className="client-dashboard-section-header">

              <div>

                <span className="client-dashboard-section-label">
                  ATIVIDADE
                </span>

                <h2>
                  Meus projetos
                </h2>

              </div>


              <a
                href="/client/requests"
                className="client-dashboard-see-all"
              >
                Ver todos →
              </a>

            </div>


            {/* =================================================
                ABAS DOS PROJETOS
            ================================================= */}

            <div className="client-dashboard-project-tabs">


              <button
                type="button"
                className={`client-dashboard-project-tab ${
                  activeProjectTab === "OPEN"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveProjectTab("OPEN")
                }
              >

                <span>
                  📂
                </span>

                <span>
                  Projetos abertos
                </span>

                <strong>
                  {openProjects}
                </strong>

              </button>


              <button
                type="button"
                className={`client-dashboard-project-tab ${
                  activeProjectTab === "IN_PROGRESS"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveProjectTab("IN_PROGRESS")
                }
              >

                <span>
                  🔄
                </span>

                <span>
                  Em andamento
                </span>

                <strong>
                  {inProgressProjects}
                </strong>

              </button>


              <button
                type="button"
                className={`client-dashboard-project-tab ${
                  activeProjectTab === "COMPLETED"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveProjectTab("COMPLETED")
                }
              >

                <span>
                  ✅
                </span>

                <span>
                  Concluídos
                </span>

                <strong>
                  {completedProjects}
                </strong>

              </button>


            </div>


            {/* =================================================
                ESTADOS DOS PROJETOS
            ================================================= */}

            {loading ? (

              <div className="client-dashboard-state">

                <div className="client-dashboard-spinner" />

                <p>
                  Carregando seus projetos...
                </p>

              </div>

            ) : error ? (

              <div className="client-dashboard-error">

                <strong>
                  Não foi possível carregar os projetos.
                </strong>

                <p>
                  {error}
                </p>

              </div>

            ) : projects.length === 0 ? (

              <div className="client-dashboard-empty">

                <div className="client-dashboard-empty-icon">
                  📋
                </div>

                <h3>
                  Ainda não tem projetos
                </h3>

                <p>
                  Encontre um profissional ou crie
                  um projeto para começar.
                </p>


                <div className="client-dashboard-empty-actions">


                  <button
                    type="button"
                    className="client-dashboard-primary-btn"
                    onClick={() => {

                      window.location.href =
                        "/client/providers";

                    }}
                  >

                    Procurar profissionais

                  </button>


                  <button
                    type="button"
                    className="client-dashboard-secondary-btn"
                    onClick={() => {

                      window.location.href =
                        "/client/projects/new";

                    }}
                  >

                    Criar projeto

                  </button>


                </div>


              </div>

            ) : filteredProjects.length === 0 ? (

              <div className="client-dashboard-empty">

                <div className="client-dashboard-empty-icon">
                  {activeProjectTab === "OPEN"
                    ? "📂"
                    : activeProjectTab === "IN_PROGRESS"
                      ? "🔄"
                      : "✅"}
                </div>

                <h3>

                  {activeProjectTab === "OPEN"
                    ? "Não tem projetos abertos"
                    : activeProjectTab === "IN_PROGRESS"
                      ? "Não tem projetos em andamento"
                      : "Não tem projetos concluídos"}

                </h3>

                <p>

                  {activeProjectTab === "OPEN"
                    ? "Quando criar um novo projeto, ele aparecerá aqui."
                    : activeProjectTab === "IN_PROGRESS"
                      ? "Os projetos que estiverem em execução aparecerão aqui."
                      : "Os projetos concluídos aparecerão aqui."}

                </p>


                {activeProjectTab === "OPEN" && (

                  <button
                    type="button"
                    className="client-dashboard-primary-btn"
                    onClick={() => {

                      window.location.href =
                        "/client/projects/new";

                    }}
                  >

                    + Criar projeto

                  </button>

                )}


              </div>

            ) : (

              <div className="client-dashboard-projects">


                {filteredProjects
                  .slice(0, 5)
                  .map((project) => (

                    <a
                      href={`/client/projects/${project.id}`}
                      className="client-dashboard-project-card"
                      key={project.id}
                    >


                      <div className="client-dashboard-project-top">


                        <div className="client-dashboard-project-icon">
                          🔧
                        </div>


                        <span
                          className={`client-dashboard-status ${getStatusClass(
                            project.status
                          )}`}
                        >

                          {getStatusLabel(
                            project.status
                          )}

                        </span>


                      </div>


                      <h3>

                        {project.title ||
                          project.name ||
                          "Projeto sem título"}

                      </h3>


                      {project.description && (

                        <p>
                          {project.description}
                        </p>

                      )}


                      <div className="client-dashboard-project-footer">


                        <span>

                          📅{" "}

                          {formatDate(
                            project.created_at ||
                            project.createdAt
                          )}

                        </span>


                        {(project.budget !== undefined &&
                          project.budget !== null) && (

                          <strong>

                            {Number(
                              project.budget
                            ).toLocaleString(
                              "pt-MZ"
                            )} MT

                          </strong>

                        )}


                      </div>


                    </a>

                  ))}


              </div>

            )}


          </section>


          {/* =================================================
              AÇÕES RÁPIDAS
          ================================================= */}

          <section className="client-dashboard-section">


            <div className="client-dashboard-section-header">

              <div>

                <span className="client-dashboard-section-label">
                  ACESSO RÁPIDO
                </span>

                <h2>
                  O que deseja fazer?
                </h2>

              </div>

            </div>


            <div className="client-dashboard-quick-actions">


              <a
                href="/client/providers"
                className="client-dashboard-quick-card"
              >

                <div className="client-dashboard-quick-icon">
                  🔎
                </div>

                <div>

                  <h3>
                    Encontrar profissional
                  </h3>

                  <p>
                    Procure profissionais por serviço
                    e localização.
                  </p>

                </div>

                <span>
                  →
                </span>

              </a>


              <a
                href="/client/projects/new"
                className="client-dashboard-quick-card"
              >

                <div className="client-dashboard-quick-icon">
                  📝
                </div>

                <div>

                  <h3>
                    Criar projeto
                  </h3>

                  <p>
                    Publique o serviço que precisa
                    e receba propostas.
                  </p>

                </div>

                <span>
                  →
                </span>

              </a>


              <a
                href="/client/chat"
                className="client-dashboard-quick-card"
              >

                <div className="client-dashboard-quick-icon">
                  💬
                </div>

                <div>

                  <h3>
                    Mensagens
                  </h3>

                  <p>
                    Converse com os profissionais
                    sobre os seus serviços.
                  </p>

                </div>

                <span>
                  →
                </span>

              </a>


            </div>


          </section>


        </section>


      </main>


    </div>

  );

}


export default ClientDashboard;