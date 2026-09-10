
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";

import {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminProviders,
  updateProviderVerification,
  getAdminProjects,
  getAdminServices,
  getAdminReviews
} from "../api/admin";


function AdminDashboard() {

  const {
    user,
    logout
  } = useAuth();


  const [stats, setStats] = useState(null);

  const [users, setUsers] = useState([]);


  // =========================================================
  // FILTROS DE USUÁRIOS
  // =========================================================

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");


  const [providers, setProviders] = useState([]);


  // =========================================================
  // FILTROS DE PRESTADORES
  // =========================================================

  const [providerSearch, setProviderSearch] = useState("");
  const [providerVerificationFilter, setProviderVerificationFilter] =
    useState("ALL");
  const [providerStatusFilter, setProviderStatusFilter] =
    useState("ALL");


  const [projects, setProjects] = useState([]);


  // =========================================================
  // FILTROS DE PROJETOS
  // =========================================================

  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("ALL");
  const [projectCategoryFilter, setProjectCategoryFilter] =
    useState("ALL");


  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);


  const [activeSection, setActiveSection] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);


  // =========================================================
  // CARREGAR DADOS ADMINISTRATIVOS
  // =========================================================

  useEffect(() => {

    async function loadAdminData() {

      try {

        setLoading(true);
        setError("");


        const [
          statsData,
          usersData,
          providersData,
          projectsData,
          servicesData,
          reviewsData
        ] = await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminProviders(),
          getAdminProjects(),
          getAdminServices(),
          getAdminReviews()
        ]);


        setStats(statsData);
        setUsers(usersData);
        setProviders(providersData);
        setProjects(projectsData);
        setServices(servicesData);
        setReviews(reviewsData);

      } catch (err) {

        console.error(
          "Erro ao carregar painel administrativo:",
          err
        );


        setError(
          err.message ||
          "Não foi possível carregar os dados administrativos."
        );

      } finally {

        setLoading(false);

      }

    }


    loadAdminData();

  }, []);


  // =========================================================
  // FILTRAR USUÁRIOS
  // =========================================================

  const filteredUsers = users.filter((item) => {

    const search = userSearch
      .toLowerCase()
      .trim();


    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.phone?.toLowerCase().includes(search);


    const matchesRole =
      userRoleFilter === "ALL" ||
      item.role === userRoleFilter;


    const matchesStatus =
      userStatusFilter === "ALL" ||
      (
        userStatusFilter === "ACTIVE" &&
        item.is_active
      ) ||
      (
        userStatusFilter === "INACTIVE" &&
        !item.is_active
      );


    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );

  });


  // =========================================================
  // FILTRAR PRESTADORES
  // =========================================================

  const filteredProviders = providers.filter((item) => {

    const search = providerSearch
      .toLowerCase()
      .trim();


    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.profession?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search);


    const matchesVerification =
      providerVerificationFilter === "ALL" ||
      (
        providerVerificationFilter === "VERIFIED" &&
        item.is_verified
      ) ||
      (
        providerVerificationFilter === "PENDING" &&
        !item.is_verified
      );


    const matchesStatus =
      providerStatusFilter === "ALL" ||
      (
        providerStatusFilter === "ACTIVE" &&
        item.is_active
      ) ||
      (
        providerStatusFilter === "INACTIVE" &&
        !item.is_active
      );


    return (
      matchesSearch &&
      matchesVerification &&
      matchesStatus
    );

  });


  // =========================================================
  // CATEGORIAS DOS PROJETOS
  // =========================================================

  const projectCategories = [
    ...new Map(
      projects
        .filter((item) => item.category_id)
        .map((item) => [
          item.category_id,
          item.category
        ])
    ).entries()
  ];


  // =========================================================
  // FILTRAR PROJETOS
  // =========================================================

  const filteredProjects = projects.filter((item) => {

    const search = projectSearch
      .toLowerCase()
      .trim();


    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search) ||
      item.client_name?.toLowerCase().includes(search) ||
      item.location?.toLowerCase().includes(search);


    const normalizedStatus =
      String(item.status || "").toUpperCase();


    const matchesStatus =
      projectStatusFilter === "ALL" ||
      normalizedStatus === projectStatusFilter;


    const matchesCategory =
      projectCategoryFilter === "ALL" ||
      String(item.category_id) ===
      String(projectCategoryFilter);


    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory
    );

  });


  // =========================================================
  // MUDAR SECÇÃO
  // =========================================================

  function handleSectionChange(section) {

    setActiveSection(section);
    setSidebarOpen(false);

  }


  // =========================================================
  // ATIVAR / DESATIVAR USUÁRIO
  // =========================================================

  async function handleUserStatus(userId) {

    try {

      await updateUserStatus(userId);


      const updatedUsers =
        await getAdminUsers();

      setUsers(updatedUsers);


      const updatedStats =
        await getAdminStats();

      setStats(updatedStats);

    } catch (err) {

      alert(
        err.message ||
        "Não foi possível alterar o estado do usuário."
      );

    }

  }


  // =========================================================
  // VERIFICAR / REMOVER VERIFICAÇÃO DO PRESTADOR
  // =========================================================

  async function handleProviderVerification(providerId) {

    try {

      await updateProviderVerification(providerId);


      const updatedProviders =
        await getAdminProviders();

      setProviders(updatedProviders);

    } catch (err) {

      alert(
        err.message ||
        "Não foi possível alterar a verificação."
      );

    }

  }


  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {

    logout();

    window.location.href = "/login";

  }


  // =========================================================
  // FORMATAR DATA
  // =========================================================

  function formatDate(date) {

    if (!date) {
      return "-";
    }


    return new Date(date).toLocaleDateString(
      "pt-MZ",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

  }


  // =========================================================
  // FORMATAR MOEDA
  // =========================================================

  function formatCurrency(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }


    return new Intl.NumberFormat(
      "pt-MZ",
      {
        style: "currency",
        currency: "MZN"
      }
    ).format(value);

  }


  // =========================================================
  // FORMATAR ESTADO DO PROJETO
  // =========================================================

  function formatProjectStatus(status) {

    const normalized =
      String(status || "").toUpperCase();


    if (normalized === "OPEN") {
      return "Aberto";
    }


    if (normalized === "IN_PROGRESS") {
      return "Em andamento";
    }


    if (normalized === "COMPLETED") {
      return "Concluído";
    }


    if (normalized === "CANCELLED") {
      return "Cancelado";
    }


    return status || "-";

  }


  // =========================================================
  // CLASSE DOS ESTADOS
  // =========================================================

  function getStatusClass(status) {

    if (!status) {
      return "";
    }


    const normalized =
      String(status).toLowerCase();


    if (
      normalized === "completed" ||
      normalized === "concluído" ||
      normalized === "concluido"
    ) {
      return "success";
    }


    if (
      normalized === "open" ||
      normalized === "aberto"
    ) {
      return "warning";
    }


    if (
      normalized === "cancelled" ||
      normalized === "cancelado"
    ) {
      return "danger";
    }


    if (
      normalized === "in_progress" ||
      normalized === "em andamento"
    ) {
      return "info";
    }


    return "";

  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="auth-page">

        <div className="auth-card">

          <h2>
            Carregando painel...
          </h2>

          <p>
            Estamos preparando os dados administrativos.
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="dashboard admin-dashboard">


      {/* =====================================================
          HEADER MOBILE
      ===================================================== */}

      <header className="dashboard-mobile-header">

        <button
          className="mobile-menu-button"
          onClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          aria-label="Abrir menu"
        >
          ☰
        </button>


        <div className="mobile-brand">

          <img
            src="/favicon-mao4.png"
            alt="Mão na Obra"
          />

          <span>
            Mão na Obra
          </span>

        </div>


        <NotificationBell />

      </header>


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <img
            src="/favicon-mao4.png"
            alt="Mão na Obra"
          />

          <div>

            <strong>
              Mão na Obra
            </strong>

            <span>
              Administração
            </span>

          </div>

        </div>


        <nav className="sidebar-menu">


          {/* VISÃO GERAL */}

          <button
            className={
              activeSection === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("overview")
            }
          >
            <span>🏠</span>
            <span>Visão geral</span>
          </button>


          {/* USUÁRIOS */}

          <button
            className={
              activeSection === "users"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("users")
            }
          >
            <span>👥</span>
            <span>Usuários</span>
          </button>


          {/* PRESTADORES */}

          <button
            className={
              activeSection === "providers"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("providers")
            }
          >
            <span>🔧</span>
            <span>Prestadores</span>
          </button>


          {/* PROJETOS */}

          <button
            className={
              activeSection === "projects"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("projects")
            }
          >
            <span>📋</span>
            <span>Projetos</span>
          </button>


          {/* SERVIÇOS */}

          <button
            className={
              activeSection === "services"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("services")
            }
          >
            <span>🛠️</span>
            <span>Serviços</span>
          </button>


          {/* AVALIAÇÕES */}

          <button
            className={
              activeSection === "reviews"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("reviews")
            }
          >
            <span>⭐</span>
            <span>Avaliações</span>
          </button>


          {/* RELATÓRIOS */}

          <button
            className={
              activeSection === "reports"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("reports")
            }
          >
            <span>📊</span>
            <span>Relatórios</span>
          </button>


          {/* CONFIGURAÇÕES */}

          <button
            className={
              activeSection === "settings"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("settings")
            }
          >
            <span>⚙️</span>
            <span>Configurações</span>
          </button>

        </nav>


        {/* ===================================================
            UTILIZADOR + LOGOUT
        =================================================== */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="sidebar-user-avatar">

              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "A"}

            </div>


            <div>

              <strong>
                {user?.name || "Administrador"}
              </strong>

              <span>
                Administrador
              </span>

            </div>

          </div>


          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>Sair</span>
          </button>

        </div>

      </aside>


      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ===================================================== */}

      <main className="dashboard-main">


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="dashboard-topbar">

          <div>

            <div className="dashboard-breadcrumb">
              Administração
            </div>

            <h1>
              Painel Administrativo
            </h1>

            <p>
              Gerencie usuários, prestadores,
              projetos e serviços da plataforma.
            </p>

          </div>


          <div className="dashboard-topbar-right">

            <span className="admin-badge">
              Área Administrativa
            </span>

            <NotificationBell />

          </div>

        </div>


        {/* ===================================================
            ERRO
        =================================================== */}

        {error && (

          <div className="admin-error">

            ⚠️ {error}

          </div>

        )}


        {/* =====================================================
            VISÃO GERAL
        ===================================================== */}

        {activeSection === "overview" && (

          <section>

            <div className="admin-section-heading">

              <div>

                <h2>
                  Visão geral
                </h2>

                <p>
                  Resumo atual da plataforma.
                </p>

              </div>

            </div>


            {/* ESTATÍSTICAS */}

            <div className="admin-stats-grid">


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  👥
                </div>

                <div>

                  <span>
                    Total de usuários
                  </span>

                  <strong>
                    {stats?.total_users ?? 0}
                  </strong>

                </div>

              </div>


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  👤
                </div>

                <div>

                  <span>
                    Clientes
                  </span>

                  <strong>
                    {stats?.total_clients ?? 0}
                  </strong>

                </div>

              </div>


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  🔧
                </div>

                <div>

                  <span>
                    Prestadores
                  </span>

                  <strong>
                    {stats?.total_providers ?? 0}
                  </strong>

                </div>

              </div>


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  📋
                </div>

                <div>

                  <span>
                    Projetos
                  </span>

                  <strong>
                    {stats?.total_projects ?? 0}
                  </strong>

                </div>

              </div>


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  🛠️
                </div>

                <div>

                  <span>
                    Serviços
                  </span>

                  <strong>
                    {stats?.total_services ?? 0}
                  </strong>

                </div>

              </div>


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  ⭐
                </div>

                <div>

                  <span>
                    Avaliações
                  </span>

                  <strong>
                    {stats?.total_reviews ?? 0}
                  </strong>

                </div>

              </div>


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  🟢
                </div>

                <div>

                  <span>
                    Usuários ativos
                  </span>

                  <strong>
                    {stats?.active_users ?? 0}
                  </strong>

                </div>

              </div>


              <div className="admin-stat-card">

                <div className="admin-stat-icon">
                  🔴
                </div>

                <div>

                  <span>
                    Usuários inativos
                  </span>

                  <strong>
                    {stats?.inactive_users ?? 0}
                  </strong>

                </div>

              </div>

            </div>


            {/* PAINÉIS RESUMIDOS */}

            <div className="admin-overview-grid">


              {/* USUÁRIOS RECENTES */}

              <div className="admin-panel">

                <div className="admin-panel-header">

                  <div>

                    <h3>
                      Usuários recentes
                    </h3>

                    <p>
                      Contas adicionadas recentemente.
                    </p>

                  </div>


                  <button
                    className="admin-link-button"
                    onClick={() =>
                      handleSectionChange("users")
                    }
                  >
                    Ver todos
                  </button>

                </div>


                <div className="admin-mini-list">

                  {users
                    .slice(0, 5)
                    .map((item) => (

                    <div
                      className="admin-mini-item"
                      key={item.id}
                    >

                      <div className="admin-avatar">

                        {item.name
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>


                      <div className="admin-mini-info">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.email}
                        </span>

                      </div>


                      <span
                        className={
                          item.is_active
                            ? "admin-status success"
                            : "admin-status danger"
                        }
                      >
                        {item.is_active
                          ? "Ativo"
                          : "Inativo"}
                      </span>

                    </div>

                  ))}


                  {users.length === 0 && (

                    <div className="admin-empty">
                      Nenhum usuário encontrado.
                    </div>

                  )}

                </div>

              </div>


              {/* PRESTADORES */}

              <div className="admin-panel">

                <div className="admin-panel-header">

                  <div>

                    <h3>
                      Prestadores
                    </h3>

                    <p>
                      Estado de verificação dos prestadores.
                    </p>

                  </div>


                  <button
                    className="admin-link-button"
                    onClick={() =>
                      handleSectionChange("providers")
                    }
                  >
                    Ver todos
                  </button>

                </div>


                <div className="admin-mini-list">

                  {providers
                    .slice(0, 5)
                    .map((item) => (

                    <div
                      className="admin-mini-item"
                      key={item.provider_id}
                    >

                      <div className="admin-avatar provider-avatar">

                        {item.name
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>


                      <div className="admin-mini-info">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.profession || "-"}
                        </span>

                      </div>


                      <span
                        className={
                          item.is_verified
                            ? "admin-status success"
                            : "admin-status warning"
                        }
                      >
                        {item.is_verified
                          ? "Verificado"
                          : "Pendente"}
                      </span>

                    </div>

                  ))}


                  {providers.length === 0 && (

                    <div className="admin-empty">
                      Nenhum prestador encontrado.
                    </div>

                  )}

                </div>

              </div>

            </div>

          </section>

        )}


        {/* =====================================================
            USUÁRIOS
        ===================================================== */}

        {activeSection === "users" && (

          <section>

            <div className="admin-section-heading">

              <div>

                <h2>
                  Usuários
                </h2>

                <p>
                  Gerencie as contas cadastradas na plataforma.
                </p>

              </div>


              <span className="admin-count">

                {filteredUsers.length} de {users.length} usuários

              </span>

            </div>


            {/* =================================================
                FILTROS DE USUÁRIOS
            ================================================= */}

            <div className="admin-user-filters">


              {/* PESQUISA */}

              <div className="admin-search-box">

                <span>
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Pesquisar por nome, email ou telefone..."
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(event.target.value)
                  }
                />

              </div>


              {/* FILTRO POR FUNÇÃO */}

              <select
                value={userRoleFilter}
                onChange={(event) =>
                  setUserRoleFilter(event.target.value)
                }
                className="admin-filter-select"
              >

                <option value="ALL">
                  Todas as funções
                </option>

                <option value="CLIENT">
                  Clientes
                </option>

                <option value="PROVIDER">
                  Prestadores
                </option>

                <option value="ADMIN">
                  Administradores
                </option>

              </select>


              {/* FILTRO POR ESTADO */}

              <select
                value={userStatusFilter}
                onChange={(event) =>
                  setUserStatusFilter(event.target.value)
                }
                className="admin-filter-select"
              >

                <option value="ALL">
                  Todos os estados
                </option>

                <option value="ACTIVE">
                  Ativos
                </option>

                <option value="INACTIVE">
                  Inativos
                </option>

              </select>


              {/* LIMPAR FILTROS */}

              {(userSearch ||
                userRoleFilter !== "ALL" ||
                userStatusFilter !== "ALL") && (

                <button
                  className="admin-clear-filters"
                  onClick={() => {

                    setUserSearch("");
                    setUserRoleFilter("ALL");
                    setUserStatusFilter("ALL");

                  }}
                >
                  Limpar filtros
                </button>

              )}

            </div>


            {/* TABELA */}

            <div className="admin-table-card">

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Usuário
                      </th>

                      <th>
                        Contacto
                      </th>

                      <th>
                        Função
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Cadastro
                      </th>

                      <th>
                        Ação
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredUsers.map((item) => (

                      <tr key={item.id}>


                        <td>

                          <div className="table-user">

                            <div className="admin-avatar">

                              {item.name
                                ?.charAt(0)
                                .toUpperCase()}

                            </div>


                            <div>

                              <strong>
                                {item.name}
                              </strong>

                              <span>
                                {item.email}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>
                          {item.phone || "-"}
                        </td>


                        <td>

                          <span className="admin-role">

                            {item.role === "ADMIN"
                              ? "Administrador"
                              : item.role === "PROVIDER"
                              ? "Prestador"
                              : "Cliente"}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              item.is_active
                                ? "admin-status success"
                                : "admin-status danger"
                            }
                          >

                            {item.is_active
                              ? "Ativo"
                              : "Inativo"}

                          </span>

                        </td>


                        <td>
                          {formatDate(item.created_at)}
                        </td>


                        <td>

                          {item.id !== user?.id && (

                            <button
                              className={
                                item.is_active
                                  ? "admin-action danger"
                                  : "admin-action success"
                              }
                              onClick={() =>
                                handleUserStatus(item.id)
                              }
                            >

                              {item.is_active
                                ? "Desativar"
                                : "Ativar"}

                            </button>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>


                {filteredUsers.length === 0 && (

                  <div className="admin-empty">

                    {users.length === 0
                      ? "Nenhum usuário encontrado."
                      : "Nenhum usuário corresponde aos filtros aplicados."
                    }

                  </div>

                )}

              </div>

            </div>

          </section>

        )}


        {/* =====================================================
            PRESTADORES
        ===================================================== */}

        {activeSection === "providers" && (

          <section>

            <div className="admin-section-heading">

              <div>

                <h2>
                  Prestadores
                </h2>

                <p>
                  Verifique e acompanhe os profissionais da plataforma.
                </p>

              </div>


              <span className="admin-count">

                {filteredProviders.length} de {providers.length} prestadores

              </span>

            </div>


            {/* =================================================
                FILTROS DE PRESTADORES
            ================================================= */}

            <div className="admin-provider-filters">


              <div className="admin-search-box">

                <span>
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Pesquisar por nome, email, profissão ou localização..."
                  value={providerSearch}
                  onChange={(event) =>
                    setProviderSearch(event.target.value)
                  }
                />

              </div>


              <select
                value={providerVerificationFilter}
                onChange={(event) =>
                  setProviderVerificationFilter(
                    event.target.value
                  )
                }
                className="admin-filter-select"
              >

                <option value="ALL">
                  Todos os prestadores
                </option>

                <option value="VERIFIED">
                  Verificados
                </option>

                <option value="PENDING">
                  Pendentes
                </option>

              </select>


              <select
                value={providerStatusFilter}
                onChange={(event) =>
                  setProviderStatusFilter(
                    event.target.value
                  )
                }
                className="admin-filter-select"
              >

                <option value="ALL">
                  Todos os estados
                </option>

                <option value="ACTIVE">
                  Contas ativas
                </option>

                <option value="INACTIVE">
                  Contas inativas
                </option>

              </select>


              {(providerSearch ||
                providerVerificationFilter !== "ALL" ||
                providerStatusFilter !== "ALL") && (

                <button
                  className="admin-clear-filters"
                  onClick={() => {

                    setProviderSearch("");
                    setProviderVerificationFilter("ALL");
                    setProviderStatusFilter("ALL");

                  }}
                >
                  Limpar filtros
                </button>

              )}

            </div>


            <div className="admin-table-card">

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Prestador
                      </th>

                      <th>
                        Profissão
                      </th>

                      <th>
                        Localização
                      </th>

                      <th>
                        Experiência
                      </th>

                      <th>
                        Verificação
                      </th>

                      <th>
                        Conta
                      </th>

                      <th>
                        Ação
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredProviders.map((item) => (

                      <tr
                        key={item.provider_id}
                      >

                        <td>

                          <div className="table-user">

                            <div className="admin-avatar provider-avatar">

                              {item.name
                                ?.charAt(0)
                                .toUpperCase()}

                            </div>


                            <div>

                              <strong>
                                {item.name}
                              </strong>

                              <span>
                                {item.email}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>
                          {item.profession || "-"}
                        </td>


                        <td>
                          {item.location || "-"}
                        </td>


                        <td>

                          {item.experience_years !== null &&
                           item.experience_years !== undefined
                            ? `${item.experience_years} anos`
                            : "-"}

                        </td>


                        <td>

                          <span
                            className={
                              item.is_verified
                                ? "admin-status success"
                                : "admin-status warning"
                            }
                          >

                            {item.is_verified
                              ? "Verificado"
                              : "Pendente"}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              item.is_active
                                ? "admin-status success"
                                : "admin-status danger"
                            }
                          >

                            {item.is_active
                              ? "Ativa"
                              : "Inativa"}

                          </span>

                        </td>


                        <td>

                          <button
                            className={
                              item.is_verified
                                ? "admin-action danger"
                                : "admin-action success"
                            }
                            onClick={() =>
                              handleProviderVerification(
                                item.provider_id
                              )
                            }
                          >

                            {item.is_verified
                              ? "Remover"
                              : "Verificar"}

                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>


                {filteredProviders.length === 0 && (

                  <div className="admin-empty">

                    {providers.length === 0
                      ? "Nenhum prestador encontrado."
                      : "Nenhum prestador corresponde aos filtros aplicados."
                    }

                  </div>

                )}

              </div>

            </div>

          </section>

        )}


        {/* =====================================================
            PROJETOS
        ===================================================== */}

        {activeSection === "projects" && (

          <section>

            <div className="admin-section-heading">

              <div>

                <h2>
                  Projetos
                </h2>

                <p>
                  Acompanhe os projetos publicados pelos clientes.
                </p>

              </div>


              <span className="admin-count">

                {filteredProjects.length} de {projects.length} projetos

              </span>

            </div>


            {/* =================================================
                FILTROS DE PROJETOS
            ================================================= */}

            <div className="admin-project-filters">


              {/* PESQUISA */}

              <div className="admin-search-box">

                <span>
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Pesquisar por projeto, cliente ou localização..."
                  value={projectSearch}
                  onChange={(event) =>
                    setProjectSearch(event.target.value)
                  }
                />

              </div>


              {/* FILTRO POR ESTADO */}

              <select
                value={projectStatusFilter}
                onChange={(event) =>
                  setProjectStatusFilter(event.target.value)
                }
                className="admin-filter-select"
              >

                <option value="ALL">
                  Todos os estados
                </option>

                <option value="OPEN">
                  Abertos
                </option>

                <option value="IN_PROGRESS">
                  Em andamento
                </option>

                <option value="COMPLETED">
                  Concluídos
                </option>

                <option value="CANCELLED">
                  Cancelados
                </option>

              </select>


              {/* FILTRO POR CATEGORIA */}

              <select
                value={projectCategoryFilter}
                onChange={(event) =>
                  setProjectCategoryFilter(event.target.value)
                }
                className="admin-filter-select"
              >

                <option value="ALL">
                  Todas as categorias
                </option>


                {projectCategories.map(
                  ([categoryId, categoryName]) => (

                    <option
                      key={categoryId}
                      value={categoryId}
                    >
                      {categoryName || "Sem categoria"}
                    </option>

                  )
                )}

              </select>


              {/* LIMPAR FILTROS */}

              {(projectSearch ||
                projectStatusFilter !== "ALL" ||
                projectCategoryFilter !== "ALL") && (

                <button
                  className="admin-clear-filters"
                  onClick={() => {

                    setProjectSearch("");
                    setProjectStatusFilter("ALL");
                    setProjectCategoryFilter("ALL");

                  }}
                >
                  Limpar filtros
                </button>

              )}

            </div>


            {/* TABELA */}

            <div className="admin-table-card">

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Projeto
                      </th>

                      <th>
                        Cliente
                      </th>

                      <th>
                        Categoria
                      </th>

                      <th>
                        Localização
                      </th>

                      <th>
                        Orçamento
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Data
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredProjects.map((item) => (

                      <tr key={item.id}>


                        {/* PROJETO */}

                        <td>

                          <div className="table-project">

                            <strong>
                              {item.title}
                            </strong>

                            <span>
                              {item.description || "-"}
                            </span>

                          </div>

                        </td>


                        {/* CLIENTE */}

                        <td>
                          {item.client_name || "-"}
                        </td>


                        {/* CATEGORIA */}

                        <td>
                          {item.category || "-"}
                        </td>


                        {/* LOCALIZAÇÃO */}

                        <td>
                          {item.location || "-"}
                        </td>


                        {/* ORÇAMENTO */}

                        <td>
                          {formatCurrency(item.budget)}
                        </td>


                        {/* ESTADO */}

                        <td>

                          <span
                            className={`admin-status ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {formatProjectStatus(item.status)}
                          </span>

                        </td>


                        {/* DATA */}

                        <td>
                          {formatDate(item.created_at)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>


                {/* ESTADO VAZIO */}

                {filteredProjects.length === 0 && (

                  <div className="admin-empty">

                    {projects.length === 0
                      ? "Nenhum projeto encontrado."
                      : "Nenhum projeto corresponde aos filtros aplicados."
                    }

                  </div>

                )}

              </div>

            </div>

          </section>

        )}


        {/* =====================================================
            SERVIÇOS
        ===================================================== */}

        {activeSection === "services" && (

          <section>

            <div className="admin-section-heading">

              <div>

                <h2>
                  Serviços
                </h2>

                <p>
                  Acompanhe os serviços publicados pelos prestadores.
                </p>

              </div>


              <span className="admin-count">

                {services.length} serviços

              </span>

            </div>


            <div className="admin-table-card">

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Serviço
                      </th>

                      <th>
                        Prestador
                      </th>

                      <th>
                        Categoria
                      </th>

                      <th>
                        Preço
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Data
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {services.map((item) => (

                      <tr key={item.id}>


                        <td>

                          <div className="table-project">

                            <strong>
                              {item.title}
                            </strong>

                            <span>
                              {item.description || "-"}
                            </span>

                          </div>

                        </td>


                        <td>

                          <div className="table-user">

                            <div className="admin-avatar provider-avatar">

                              {item.provider_name
                                ?.charAt(0)
                                .toUpperCase()}

                            </div>


                            <div>

                              <strong>
                                {item.provider_name}
                              </strong>

                              <span>
                                {item.provider_email}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>
                          {item.category_name || "-"}
                        </td>


                        <td>
                          {formatCurrency(item.price)}
                        </td>


                        <td>

                          <span
                            className={
                              item.is_active
                                ? "admin-status success"
                                : "admin-status danger"
                            }
                          >

                            {item.is_active
                              ? "Ativo"
                              : "Inativo"}

                          </span>

                        </td>


                        <td>
                          {formatDate(item.created_at)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>


                {services.length === 0 && (

                  <div className="admin-empty">
                    Nenhum serviço encontrado.
                  </div>

                )}

              </div>

            </div>

          </section>

        )}


        {/* =====================================================
            AVALIAÇÕES
        ===================================================== */}

        {activeSection === "reviews" && (

          <section>

            <div className="admin-section-heading">

              <div>

                <h2>
                  Avaliações
                </h2>

                <p>
                  Acompanhe as avaliações feitas pelos clientes.
                </p>

              </div>


              <span className="admin-count">

                {reviews.length} avaliações

              </span>

            </div>


            <div className="admin-reviews-grid">

              {reviews.map((item) => (

                <div
                  className="admin-review-card"
                  key={item.id}
                >


                  <div className="admin-review-header">

                    <div className="admin-avatar">

                      {item.client_name
                        ?.charAt(0)
                        .toUpperCase()}

                    </div>


                    <div>

                      <strong>
                        {item.client_name}
                      </strong>

                      <span>
                        Avaliação de um prestador
                      </span>

                    </div>

                  </div>


                  <div className="admin-stars">

                    {"★".repeat(
                      Number(item.rating) || 0
                    )}

                    {"☆".repeat(
                      Math.max(
                        0,
                        5 - (Number(item.rating) || 0)
                      )
                    )}

                  </div>


                  <p className="admin-review-comment">

                    {item.comment ||
                      "O cliente não deixou um comentário."}

                  </p>


                  <div className="admin-review-footer">

                    <span>
                      Prestador #{item.provider_id}
                    </span>

                    <span>
                      {formatDate(item.created_at)}
                    </span>

                  </div>

                </div>

              ))}


              {reviews.length === 0 && (

                <div className="admin-empty">
                  Nenhuma avaliação encontrada.
                </div>

              )}

            </div>

          </section>

        )}


        {/* =====================================================
            RELATÓRIOS
        ===================================================== */}

        {activeSection === "reports" && (

          <section>

            <div className="admin-placeholder">

              <div className="admin-placeholder-icon">
                📊
              </div>


              <h2>
                Relatórios
              </h2>


              <p>
                A área de relatórios será adicionada
                numa próxima etapa, com indicadores
                de crescimento e atividade da plataforma.
              </p>

            </div>

          </section>

        )}


        {/* =====================================================
            CONFIGURAÇÕES
        ===================================================== */}

        {activeSection === "settings" && (

          <section>

            <div className="admin-placeholder">

              <div className="admin-placeholder-icon">
                ⚙️
              </div>


              <h2>
                Configurações
              </h2>


              <p>
                As configurações administrativas da
                plataforma serão adicionadas numa próxima etapa.
              </p>

            </div>

          </section>

        )}

      </main>


      {/* =====================================================
          OVERLAY MOBILE
      ===================================================== */}

      {sidebarOpen && (

        <div
          className="dashboard-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}

    </div>

  );

}


export default AdminDashboard;

