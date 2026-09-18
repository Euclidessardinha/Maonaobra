
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import NotificationBell from "../components/NotificationBell";

import {
  getOpenProjects
} from "../api/provider";

import "./ProviderProjects.css";
import { getCategories } from "../api/api";


function ProviderProjects() {

  const { user, logout } = useAuth();

  const [projects, setProjects] = useState([]);

  const [availableCategories, setAvailableCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODAS");


  /*
  =========================================================
  MENU MOBILE
  =========================================================
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


  function handleLogout() {

    setMenuOpen(false);

    logout();

  }


  function handleClientMode() {

    window.location.href = "/client";

  }


  /*
  =========================================================
  CARREGAR PROJETOS
  =========================================================
  */

  useEffect(() => {

    async function loadProjectsAndCategories() {

      try {

        setLoading(true);
        setError("");

        const [
          projectsData,
          categoriesData
        ] = await Promise.all([
          getOpenProjects(),
          getCategories()
        ]);

        setProjects(
          Array.isArray(projectsData)
            ? projectsData
            : []
        );

        setAvailableCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );

      } catch (error) {

        console.error(
          "Erro ao carregar projetos e categorias:",
          error
        );

        setError(
          error.message ||
          "Erro ao carregar projetos disponíveis."
        );

      } finally {

        setLoading(false);

      }

    }

    loadProjectsAndCategories();

  }, []);


  /*
  =========================================================
  FUNÇÕES
  =========================================================
  */

  function handleViewProject(projectId) {

    window.location.href =
      `/provider/projects/${projectId}`;

  }


  function formatBudget(budget) {

    if (
      budget === null ||
      budget === undefined ||
      budget === ""
    ) {

      return "Não definido";

    }

    const numericBudget = Number(budget);

    if (Number.isNaN(numericBudget)) {

      return "Não definido";

    }

    return `${numericBudget.toLocaleString("pt-MZ")} MT`;

  }


  function formatDate(date) {

    if (!date) {
      return "";
    }

    const projectDate = new Date(date);

    if (
      Number.isNaN(
        projectDate.getTime()
      )
    ) {
      return "";
    }

    return projectDate.toLocaleDateString(
      "pt-MZ",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

  }


  function getInitials(name) {

    if (!name) {
      return "P";
    }

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

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


  /*
  =========================================================
  CATEGORIAS
  =========================================================
  */

  const categories = useMemo(() => {

    const values = availableCategories
      .map((category) => {

        if (
          typeof category === "string"
        ) {

          return category.trim();

        }

        return String(
          category?.name ||
          category?.title ||
          ""
        ).trim();

      })
      .filter(Boolean);

    return [
      "TODAS",
      ...Array.from(
        new Set(values)
      ).sort((a, b) =>
        a.localeCompare(b, "pt")
      )
    ];

  }, [availableCategories]);


  /*
  =========================================================
  FILTROS
  =========================================================
  */

  const filteredProjects = useMemo(() => {

    const normalizedSearch =
      search
        .trim()
        .toLowerCase();

    return projects.filter(
      (project) => {

        const matchesSearch =
          !normalizedSearch ||
          String(
            project.title || ""
          )
            .toLowerCase()
            .includes(normalizedSearch) ||
          String(
            project.description || ""
          )
            .toLowerCase()
            .includes(normalizedSearch) ||
          String(
            project.location || ""
          )
            .toLowerCase()
            .includes(normalizedSearch) ||
          String(
            project.category || ""
          )
            .toLowerCase()
            .includes(normalizedSearch);

        const projectCategory =
          typeof project.category === "object"
            ? (
                project.category?.name ||
                project.category?.title ||
                ""
              )
            : String(
                project.category || ""
              );

        const matchesCategory =
          categoryFilter === "TODAS" ||
          projectCategory.trim() === categoryFilter;

        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );

  }, [
    projects,
    search,
    categoryFilter
  ]);


  return (

    <div className="provider-projects-page">

      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="provider-mobile-header">

        <button
          type="button"
          className="provider-hamburger"
          onClick={() =>
            setMenuOpen(true)
          }
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


      {/* =====================================================
          OVERLAY MOBILE
      ====================================================== */}

      {menuOpen && (

        <div
          className="provider-sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />

      )}


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`provider-sidebar ${
          menuOpen
            ? "provider-sidebar-open"
            : ""
        }`}
      >

        <button
          type="button"
          className="provider-sidebar-close"
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          ×
        </button>


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


        <div className="provider-nav-title">
          MENU PRINCIPAL
        </div>


        <nav className="provider-sidebar-nav">

          <a
            href="/provider"
            onClick={closeMenu}
            className="provider-nav-link"
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

          </a>


          <a
            href="/provider/projects"
            onClick={closeMenu}
            className="provider-nav-link active"
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
            className="provider-nav-link provider-messages-link"
          >

            <span className="provider-nav-icon provider-messages-icon">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >

                <path
                  d="M20 11.5C20 15.09 16.42 18 12 18C11.05 18 10.14 17.87 9.3 17.63L5 20L5.93 16.29C4.14 15.12 3 13.41 3 11.5C3 7.91 6.58 5 11 5H12C16.42 5 20 7.91 20 11.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </span>

            <span className="provider-messages-label">
              Mensagens
            </span>

            <span className="provider-messages-status">

              <span className="provider-messages-status-dot"></span>

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


        <div className="provider-sidebar-bottom">

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
            type="button"
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


      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ====================================================== */}

      <main className="provider-projects-main">

        <header className="provider-projects-topbar">

          <div className="provider-projects-heading">

            <div className="provider-projects-heading-label">

              <span className="provider-projects-heading-dot"></span>

              OPORTUNIDADES PROFISSIONAIS

            </div>


            <h1>
              Projetos disponíveis
            </h1>


            <p>
              Encontre projetos publicados por clientes
              e envie propostas para novas oportunidades.
            </p>

          </div>


          <div className="provider-projects-header-actions">

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

              <span>
                ＋
              </span>

              Criar serviço

            </a>

          </div>

        </header>


        {error && (

          <div className="provider-projects-error">

            <div className="provider-projects-error-icon">
              !
            </div>

            <div>

              <strong>
                Não foi possível carregar os projetos
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>

        )}


        {!loading && !error && (

          <section className="provider-projects-tools">

            <div className="provider-projects-search">

              <span className="provider-projects-search-icon">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Pesquisar por projeto, categoria ou localização..."
                aria-label="Pesquisar projetos"
              />

              {search && (

                <button
                  type="button"
                  className="provider-projects-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Limpar pesquisa"
                >
                  ×
                </button>

              )}

            </div>


            <div className="provider-projects-filter">

              <label htmlFor="project-category">
                Categoria
              </label>

              <select
                id="project-category"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >

                {categories.map(
                  (category) => (

                    <option
                      key={category}
                      value={category}
                    >
                      {category === "TODAS"
                        ? "Todas as categorias"
                        : category}
                    </option>

                  )
                )}

              </select>

            </div>

          </section>

        )}


        {loading && (

          <div className="provider-projects-loading">

            <div className="provider-projects-spinner"></div>

            <h3>
              Procurando projetos...
            </h3>

            <p>
              Aguarde enquanto buscamos novas
              oportunidades para você.
            </p>

          </div>

        )}


        {!loading && !error && (

          <section className="provider-projects-section">

            <div className="provider-projects-section-header">

              <div>

                <div className="provider-projects-section-kicker">
                  OPORTUNIDADES
                </div>

                <h2>
                  Projetos abertos
                </h2>

                <p>

                  {filteredProjects.length === 1
                    ? "1 projeto disponível para receber propostas"
                    : `${filteredProjects.length} projetos disponíveis para receber propostas`
                  }

                </p>

              </div>


              {projects.length > 0 && (

                <div className="provider-projects-total">

                  <strong>
                    {projects.length}
                  </strong>

                  <span>
                    {projects.length === 1
                      ? "projeto"
                      : "projetos"}
                  </span>

                </div>

              )}

            </div>


            {projects.length === 0 && (

              <div className="provider-projects-empty">

                <div className="provider-projects-empty-icon">
                  ◉
                </div>

                <h2>
                  Nenhum projeto disponível
                </h2>

                <p>
                  Neste momento não existem projetos
                  abertos para receber propostas.
                  Volte mais tarde para encontrar
                  novas oportunidades.
                </p>

                <a
                  href="/provider"
                  className="provider-projects-empty-btn"
                >
                  ← Voltar ao dashboard
                </a>

              </div>

            )}


            {projects.length > 0 &&
              filteredProjects.length === 0 && (

                <div className="provider-projects-empty">

                  <div className="provider-projects-empty-icon">
                    ⌕
                  </div>

                  <h2>
                    Nenhum projeto encontrado
                  </h2>

                  <p>
                    Não encontramos projetos que
                    correspondam à sua pesquisa ou
                    categoria selecionada.
                  </p>

                  <button
                    type="button"
                    className="provider-projects-empty-btn"
                    onClick={() => {
                      setSearch("");
                      setCategoryFilter("TODAS");
                    }}
                  >
                    Limpar filtros
                  </button>

                </div>

              )}


            {filteredProjects.length > 0 && (

              <div className="provider-projects-grid">

                {filteredProjects.map(
                  (project) => {

                    const projectCategory =
                      typeof project.category === "object"
                        ? (
                            project.category?.name ||
                            project.category?.title ||
                            "Sem categoria"
                          )
                        : (
                            project.category ||
                            "Sem categoria"
                          );

                    return (

                      <article
                        key={project.id}
                        className="provider-project-card"
                      >

                        <div className="provider-project-card-glow"></div>

                        <div className="provider-project-card-top">

                          <div className="provider-project-category">

                            <span className="provider-project-category-icon">
                              ◉
                            </span>

                            <span className="provider-project-category-name">
                              {projectCategory}
                            </span>

                          </div>


                          <span className="provider-project-status">
                            ABERTO
                          </span>

                        </div>


                        <div className="provider-project-opportunity">

                          <span className="provider-project-opportunity-icon">
                            ✦
                          </span>

                          NOVO PROJETO

                        </div>


                        <h3>
                          {project.title ||
                            "Projeto sem título"}
                        </h3>


                        <p className="provider-project-description">

                          {project.description
                            ? project.description.length > 190
                              ? `${project.description.substring(
                                  0,
                                  190
                                )}...`
                              : project.description
                            : "O cliente não adicionou uma descrição para este projeto."}

                        </p>


                        <div className="provider-project-highlight">

                          <div className="provider-project-budget-block">

                            <span>
                              ORÇAMENTO DO PROJETO
                            </span>

                            <strong>
                              {formatBudget(
                                project.budget
                              )}
                            </strong>

                          </div>

                          <div className="provider-project-budget-icon">
                            $
                          </div>

                        </div>


                        <div className="provider-project-info">

                          <div className="provider-project-info-item">

                            <span>
                              📍 Localização
                            </span>

                            <strong>
                              {project.location ||
                                "Não informado"}
                            </strong>

                          </div>


                          <div className="provider-project-info-item">

                            <span>
                              🗓 Publicado
                            </span>

                            <strong>
                              {project.created_at
                                ? formatDate(
                                    project.created_at
                                  )
                                : "Recentemente"}
                            </strong>

                          </div>

                        </div>


                        <div className="provider-project-card-footer">

                          <div className="provider-project-date">

                            Oportunidade disponível

                          </div>


                          <button
                            type="button"
                            className="provider-project-view-btn"
                            onClick={() =>
                              handleViewProject(
                                project.id
                              )
                            }
                          >

                            Ver projeto

                            <span>
                              →
                            </span>

                          </button>

                        </div>

                      </article>

                    );

                  }
                )}

              </div>

            )}

          </section>

        )}

      </main>

    </div>

  );

}


export default ProviderProjects;

