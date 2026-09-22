
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import "./AdminDashboard.css";

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
  
  const [selectedUser, setSelectedUser] = useState(null);




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
  // PLANOS E MONETIZAÇÃO (CONFIGURAÇÃO LOCAL - FRONTEND)
  // =========================================================

  const [editingPlan, setEditingPlan] = useState(null);
  const [promotionSettings, setPromotionSettings] = useState({
    duration: 7,
    price: 100,
    active: true
  });

  const [plans, setPlans] = useState([
    {
      id: "free",
      name: "Gratuito",
      price: 0,
      period: "mês",
      description: "Recursos essenciais para começar.",
      badge: "Plano base",
      features: [
        "Criar serviços",
        "Receber pedidos",
        "Enviar propostas",
        "Chat",
        "Avaliações"
      ]
    },
    {
      id: "professional",
      name: "Profissional",
      price: 499,
      period: "mês",
      description: "Mais visibilidade e estatísticas.",
      badge: "Mais utilizado",
      features: [
        "Tudo do Gratuito",
        "Ver visitantes do perfil",
        "Estatísticas",
        "Serviços mais vistos",
        "Destaque como prestador",
        "Benefícios em promoções"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 999,
      period: "mês",
      description: "Mais recursos para ganhar visibilidade.",
      badge: "Premium",
      features: [
        "Tudo do Profissional",
        "Maior destaque",
        "Mais visibilidade",
        "Promoções incluídas",
        "Estatísticas avançadas"
      ]
    }
  ]);


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
// DETALHES DO USUÁRIO
// =========================================================

  function openUserDetails(item) {
    setSelectedUser(item);
  }

  function closeUserDetails() {
    setSelectedUser(null);
  }


// =========================================================
// OBTER PERFIL DE PRESTADOR DO USUÁRIO
// =========================================================

  function getUserProviderProfile(userId) {

    return providers.find(
      (provider) =>
        String(provider.user_id) === String(userId) ||
        String(provider.provider_id) === String(userId)
    );

  }


// =========================================================
// VERIFICAR SE O USUÁRIO POSSUI PERFIL DE PRESTADOR
// =========================================================

  function isProviderUser(item) {

    if (!item) {
      return false;
    }

    if (item.role === "PROVIDER") {
      return true;
    }

    return Boolean(
      getUserProviderProfile(item.id)
    );
  }


// =========================================================
// CAPACIDADES DO USUÁRIO
// =========================================================

  function getUserCapabilities(item) {

    if (!item) {
      return [];
    }

    const capabilities = [];

    if (item.role === "ADMIN") {

      return [
        {
          icon: "👥",
          title: "Gerenciar usuários",
          description: "Consultar e alterar o estado das contas."
        },
        {
          icon: "🔧",
          title: "Gerenciar prestadores",
          description: "Consultar e controlar verificações profissionais."
        },
        {
          icon: "📋",
          title: "Acompanhar projetos",
          description: "Visualizar os projetos publicados na plataforma."
        },
        {
          icon: "🛠️",
          title: "Acompanhar serviços",
          description: "Visualizar os serviços publicados pelos prestadores."
        },
        {
          icon: "⭐",
          title: "Acompanhar avaliações",
          description: "Consultar as avaliações existentes na plataforma."
        },
        {
          icon: "📊",
          title: "Acesso administrativo",
          description: "Aceder às informações administrativas da plataforma."
        }
      ];

    }


  if (item.role === "PROVIDER") {

    return [
      {
        icon: "👤",
        title: "Manter perfil profissional",
        description: "Criar e atualizar as informações profissionais."
      },
      {
        icon: "🛠️",
        title: "Publicar serviços",
        description: "Disponibilizar serviços para clientes."
      },
      {
        icon: "📋",
        title: "Consultar projetos",
        description: "Encontrar projetos publicados por clientes."
      },
      {
        icon: "💼",
        title: "Enviar propostas",
        description: "Apresentar propostas para projetos disponíveis."
      },
      {
        icon: "💬",
        title: "Comunicar com clientes",
        description: "Trocar mensagens relacionadas aos projetos."
      },
      {
        icon: "⭐",
        title: "Receber avaliações",
        description: "Receber avaliações após trabalhos realizados."
      }
    ];

  }


  return [
    {
      icon: "📋",
      title: "Criar projetos",
      description: "Publicar pedidos de serviços na plataforma."
    },
    {
      icon: "🔎",
      title: "Procurar prestadores",
      description: "Encontrar profissionais disponíveis."
    },
    {
      icon: "💼",
      title: "Receber propostas",
      description: "Receber propostas dos prestadores."
    },
    {
      icon: "🤝",
      title: "Selecionar prestadores",
      description: "Escolher um profissional para realizar um projeto."
    },
    {
      icon: "💬",
      title: "Comunicar com prestadores",
      description: "Trocar mensagens relacionadas aos projetos."
    },
    {
      icon: "⭐",
      title: "Avaliar serviços",
      description: "Avaliar prestadores após a realização do trabalho."
    }
  ];

}


// =========================================================
// NOME DA FUNÇÃO
// =========================================================

  function getRoleName(role) {

    if (role === "ADMIN") {
      return "Administrador";
    }

    if (role === "PROVIDER") {
      return "Prestador";
    }

    return "Cliente";

  }


// =========================================================
// COR DA FUNÇÃO
// =========================================================

  function getRoleClass(role) {

    if (role === "ADMIN") {
      return "admin-role-admin";
    }

    if (role === "PROVIDER") {
      return "admin-role-provider";
    }

    return "admin-role-client";

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


          {/* PLANOS E MONETIZAÇÃO */}

          <button
            className={
              activeSection === "monetization"
                ? "active"
                : ""
            }
            onClick={() =>
              handleSectionChange("monetization")
            }
          >
            <span>💳</span>
            <span>Planos e Monetização</span>
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
                      className="admin-mini-item admin-clickable-user"
                      key={item.id}
                      onClick={() => openUserDetails(item)}
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

                      <tr key={item.id}
                          className="admin-user-row"
                          onClick={() => openUserDetails(item)}
                      >


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
                              onClick={(event) =>{
                                event.stopPropagation();
                                handleUserStatus(item.id)
                              }}
                              
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
            PLANOS E MONETIZAÇÃO
        ===================================================== */}

        {activeSection === "monetization" && (

          <section className="admin-monetization-page">

            <div className="admin-section-heading admin-monetization-heading">

              <div>
                <span className="admin-monetization-eyebrow">
                  MONETIZAÇÃO
                </span>

                <h1>
                  Planos e Monetização
                </h1>

                <p>
                  Gerencie planos, promoções e recursos de visibilidade da plataforma.
                </p>
              </div>

              <div className="admin-monetization-heading-badge">
                <span>●</span>
                Estrutura comercial
              </div>

            </div>


            {/* RESUMO */}

            <div className="admin-monetization-stats-grid">

              <div className="admin-monetization-stat-card revenue">
                <div className="admin-monetization-stat-icon">💰</div>
                <div>
                  <span>RECEITA</span>
                  <strong>— MT</strong>
                  <small>Aguardando integração financeira</small>
                </div>
              </div>

              <div className="admin-monetization-stat-card promotion">
                <div className="admin-monetization-stat-icon">🚀</div>
                <div>
                  <span>PROMOÇÕES</span>
                  <strong>—</strong>
                  <small>Serviços promovidos</small>
                </div>
              </div>

              <div className="admin-monetization-stat-card highlight">
                <div className="admin-monetization-stat-icon">⭐</div>
                <div>
                  <span>DESTAQUES</span>
                  <strong>—</strong>
                  <small>Prestadores em destaque</small>
                </div>
              </div>

              <div className="admin-monetization-stat-card subscribers">
                <div className="admin-monetization-stat-icon">👥</div>
                <div>
                  <span>ASSINATURAS</span>
                  <strong>—</strong>
                  <small>Planos pagos ativos</small>
                </div>
              </div>

            </div>


            {/* VISÃO GERAL */}

            <div className="admin-monetization-overview-grid">

              <div className="admin-monetization-panel admin-revenue-panel">

                <div className="admin-monetization-panel-header">
                  <div>
                    <span>DESEMPENHO</span>
                    <h2>Receita da plataforma</h2>
                  </div>

                  <select className="admin-monetization-period">
                    <option>Últimos 30 dias</option>
                    <option>Últimos 3 meses</option>
                    <option>Últimos 6 meses</option>
                    <option>Último ano</option>
                  </select>
                </div>

                <div className="admin-revenue-placeholder">
                  <div className="admin-revenue-placeholder-icon">📈</div>
                  <strong>Dados financeiros ainda não integrados</strong>
                  <p>
                    O gráfico será preenchido quando as transações e pagamentos forem ligados ao backend.
                  </p>
                </div>

              </div>


              <div className="admin-monetization-panel">

                <div className="admin-monetization-panel-header">
                  <div>
                    <span>ASSINATURAS</span>
                    <h2>Distribuição dos planos</h2>
                  </div>
                </div>

                <div className="admin-plan-distribution">
                  <div className="admin-plan-distribution-row">
                    <div><span className="dot free" />Gratuito</div>
                    <strong>—</strong>
                  </div>
                  <div className="admin-plan-progress"><span style={{ width: "72%" }} /></div>

                  <div className="admin-plan-distribution-row">
                    <div><span className="dot professional" />Profissional</div>
                    <strong>—</strong>
                  </div>
                  <div className="admin-plan-progress"><span style={{ width: "21%" }} /></div>

                  <div className="admin-plan-distribution-row">
                    <div><span className="dot premium" />Premium</div>
                    <strong>—</strong>
                  </div>
                  <div className="admin-plan-progress"><span style={{ width: "7%" }} /></div>

                  <p className="admin-monetization-note">
                    Percentagens ilustrativas enquanto os dados de assinaturas não estiverem ligados ao backend.
                  </p>
                </div>

              </div>

            </div>


            {/* PLANOS */}

            <div className="admin-monetization-block">

              <div className="admin-monetization-block-heading">
                <div>
                  <span>PLANOS</span>
                  <h2>Planos de uso</h2>
                </div>
                <p>
                  Os planos definem recursos de visibilidade. Nesta fase, não limitam a criação de projetos ou serviços.
                </p>
              </div>

              <div className="admin-plans-grid">

                {plans.map((plan) => (

                  <div
                    className={`admin-plan-card ${
                      plan.id === "professional" ? "featured" : ""
                    }`}
                    key={plan.id}
                  >

                    {plan.id === "professional" && (
                      <span className="admin-plan-featured-badge">
                        MAIS UTILIZADO
                      </span>
                    )}

                    <div className="admin-plan-card-top">
                      <div>
                        <span className="admin-plan-badge">{plan.badge}</span>
                        <h3>{plan.name}</h3>
                        <p>{plan.description}</p>
                      </div>
                    </div>

                    <div className="admin-plan-price">
                      <strong>{plan.price.toLocaleString("pt-MZ")}</strong>
                      <span>MT / {plan.period}</span>
                    </div>

                    <div className="admin-plan-features">
                      {plan.features.map((feature, index) => (
                        <div key={index}>
                          <span>✓</span>
                          <p>{feature}</p>
                        </div>
                      ))}
                    </div>

                    {editingPlan === plan.id ? (
                      <div className="admin-plan-edit-box">
                        <label>
                          Preço mensal
                          <input
                            type="number"
                            min="0"
                            value={plan.price}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              setPlans((current) =>
                                current.map((item) =>
                                  item.id === plan.id
                                    ? { ...item, price: Number.isFinite(value) ? value : 0 }
                                    : item
                                )
                              );
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          className="admin-plan-save"
                          onClick={() => setEditingPlan(null)}
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="admin-plan-edit"
                        onClick={() => setEditingPlan(plan.id)}
                      >
                        Editar plano
                      </button>
                    )}

                  </div>

                ))}

              </div>

            </div>


            {/* PROMOÇÃO */}

            <div className="admin-monetization-block">

              <div className="admin-monetization-block-heading">
                <div>
                  <span>PROMOÇÕES</span>
                  <h2>Promoção de serviço</h2>
                </div>
                <p>
                  Crie uma forma simples de monetizar a visibilidade dos serviços dos prestadores.
                </p>
              </div>

              <div className="admin-promotion-card">

                <div className="admin-promotion-icon">🚀</div>

                <div className="admin-promotion-content">
                  <div className="admin-promotion-title-row">
                    <div>
                      <span className="admin-promotion-label">PROMOÇÃO ATUAL</span>
                      <h3>Destaque de serviço</h3>
                    </div>

                    <span className={
                      promotionSettings.active
                        ? "admin-monetization-status active"
                        : "admin-monetization-status inactive"
                    }>
                      {promotionSettings.active ? "● Ativa" : "● Inativa"}
                    </span>
                  </div>

                  <p>
                    O serviço promovido recebe maior destaque para potenciais clientes durante o período definido.
                  </p>

                  <div className="admin-promotion-values">
                    <div>
                      <span>DURAÇÃO</span>
                      <strong>{promotionSettings.duration} dias</strong>
                    </div>
                    <div>
                      <span>PREÇO</span>
                      <strong>{promotionSettings.price.toLocaleString("pt-MZ")} MT</strong>
                    </div>
                  </div>
                </div>

                <div className="admin-promotion-editor">
                  <label>
                    Duração
                    <select
                      value={promotionSettings.duration}
                      onChange={(event) =>
                        setPromotionSettings((current) => ({
                          ...current,
                          duration: Number(event.target.value)
                        }))
                      }
                    >
                      <option value={3}>3 dias</option>
                      <option value={7}>7 dias</option>
                      <option value={15}>15 dias</option>
                      <option value={30}>30 dias</option>
                    </select>
                  </label>

                  <label>
                    Preço (MT)
                    <input
                      type="number"
                      min="0"
                      value={promotionSettings.price}
                      onChange={(event) =>
                        setPromotionSettings((current) => ({
                          ...current,
                          price: Number(event.target.value) || 0
                        }))
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-promotion-toggle"
                    onClick={() =>
                      setPromotionSettings((current) => ({
                        ...current,
                        active: !current.active
                      }))
                    }
                  >
                    {promotionSettings.active ? "Desativar promoção" : "Ativar promoção"}
                  </button>
                </div>

              </div>

            </div>


            {/* DESEMPENHO */}

            <div className="admin-monetization-panel admin-promotion-performance">

              <div className="admin-monetization-panel-header">
                <div>
                  <span>DESEMPENHO</span>
                  <h2>Resultados das promoções</h2>
                </div>
              </div>

              <div className="admin-promotion-performance-grid">
                <div><span>🚀</span><strong>—</strong><small>Serviços promovidos</small></div>
                <div><span>👁️</span><strong>—</strong><small>Visualizações geradas</small></div>
                <div><span>💬</span><strong>—</strong><small>Contactos gerados</small></div>
                <div><span>💰</span><strong>— MT</strong><small>Receita</small></div>
              </div>

            </div>


            {/* TRANSAÇÕES */}

            <div className="admin-monetization-panel admin-transactions-panel">

              <div className="admin-monetization-panel-header">
                <div>
                  <span>HISTÓRICO</span>
                  <h2>Transações recentes</h2>
                </div>

                <button type="button" className="admin-monetization-filter-button">
                  Todas as transações ▾
                </button>
              </div>

              <div className="admin-transactions-empty">
                <div>🧾</div>
                <strong>Nenhuma transação registada</strong>
                <p>
                  As transações aparecerão aqui quando o sistema de pagamentos estiver integrado.
                </p>
              </div>

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

      {/* =====================================================
    MODAL / PERFIL DO USUÁRIO
===================================================== */}

{selectedUser && (

  <div
    className="admin-user-modal-overlay"
    onClick={closeUserDetails}
  >

    <div
      className="admin-user-modal"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      {/* HEADER */}

      <div className="admin-user-modal-header">

        <div>

          <span className="admin-user-modal-eyebrow">
            PERFIL DO USUÁRIO
          </span>

          <h2>
            Informações da conta
          </h2>

        </div>

        <button
          className="admin-user-modal-close"
          onClick={closeUserDetails}
          aria-label="Fechar"
        >
          ×
        </button>

      </div>


      {/* PERFIL PRINCIPAL */}

      <div className="admin-user-profile">

        <div className="admin-user-profile-avatar">

          {selectedUser.name
            ?.charAt(0)
            .toUpperCase() || "U"}

        </div>


        <div className="admin-user-profile-main">

          <h3>
            {selectedUser.name || "Usuário"}
          </h3>

          <p>
            {selectedUser.email || "-"}
          </p>

          <div className="admin-user-profile-badges">

            <span
              className={`admin-user-role-badge ${getRoleClass(
                selectedUser.role
              )}`}
            >
              {getRoleName(selectedUser.role)}
            </span>

            <span
              className={
                selectedUser.is_active
                  ? "admin-user-status-badge active"
                  : "admin-user-status-badge inactive"
              }
            >
              <span />

              {selectedUser.is_active
                ? "Conta ativa"
                : "Conta inativa"}
            </span>

          </div>

        </div>

      </div>


      {/* INFORMAÇÕES DA CONTA */}

      <div className="admin-user-detail-section">

        <div className="admin-user-detail-section-title">

          <span>
            🔐
          </span>

          <div>

            <strong>
              Informações da conta
            </strong>

            <small>
              Dados básicos do usuário.
            </small>

          </div>

        </div>


        <div className="admin-user-info-grid">

          <div className="admin-user-info-item">

            <span>ID do usuário</span>

            <strong>
              #{selectedUser.id}
            </strong>

          </div>


          <div className="admin-user-info-item">

            <span>Função</span>

            <strong>
              {getRoleName(selectedUser.role)}
            </strong>

          </div>


          <div className="admin-user-info-item">

            <span>Email</span>

            <strong>
              {selectedUser.email || "-"}
            </strong>

          </div>


          <div className="admin-user-info-item">

            <span>Telefone</span>

            <strong>
              {selectedUser.phone || "-"}
            </strong>

          </div>


          <div className="admin-user-info-item">

            <span>Cadastro</span>

            <strong>
              {formatDate(selectedUser.created_at)}
            </strong>

          </div>


          <div className="admin-user-info-item">

            <span>Estado</span>

            <strong
              className={
                selectedUser.is_active
                  ? "text-success"
                  : "text-danger"
              }
            >
              {selectedUser.is_active
                ? "Ativo"
                : "Inativo"}
            </strong>

          </div>

        </div>

      </div>


      {/* PERFIL DE PRESTADOR */}

      {isProviderUser(selectedUser) && (

        <>

          {(() => {

            const provider =
              getUserProviderProfile(
                selectedUser.id
              );

            if (!provider) {
              return null;
            }

            return (

              <div className="admin-user-detail-section">

                <div className="admin-user-detail-section-title">

                  <span>
                    🔧
                  </span>

                  <div>

                    <strong>
                      Perfil profissional
                    </strong>

                    <small>
                      Informações como prestador.
                    </small>

                  </div>

                </div>


                <div className="admin-provider-profile-card">

                  <div className="admin-provider-profile-top">

                    <div>

                      <span>
                        PROFISSÃO
                      </span>

                      <strong>
                        {provider.profession || "-"}
                      </strong>

                    </div>


                    <span
                      className={
                        provider.is_verified
                          ? "admin-status success"
                          : "admin-status warning"
                      }
                    >
                      {provider.is_verified
                        ? "✓ Verificado"
                        : "Pendente"}
                    </span>

                  </div>


                  <div className="admin-user-info-grid">

                    <div className="admin-user-info-item">

                      <span>Localização</span>

                      <strong>
                        {provider.location || "-"}
                      </strong>

                    </div>


                    <div className="admin-user-info-item">

                      <span>Experiência</span>

                      <strong>
                        {provider.experience_years !== null &&
                        provider.experience_years !== undefined
                          ? `${provider.experience_years} anos`
                          : "-"}
                      </strong>

                    </div>


                    <div className="admin-user-info-item">

                      <span>Preço por hora</span>

                      <strong>
                        {provider.hourly_rate
                          ? formatCurrency(
                              provider.hourly_rate
                            )
                          : "-"}
                      </strong>

                    </div>


                    <div className="admin-user-info-item">

                      <span>Estado</span>

                      <strong
                        className={
                          provider.is_active
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {provider.is_active
                          ? "Ativo"
                          : "Inativo"}
                      </strong>

                    </div>

                  </div>


                  {provider.bio && (

                    <div className="admin-provider-bio">

                      <span>
                        BIOGRAFIA
                      </span>

                      <p>
                        {provider.bio}
                      </p>

                    </div>

                  )}

                </div>

              </div>

            );

          })()}

        </>

      )}


      {/* CAPACIDADES */}

      <div className="admin-user-detail-section">

        <div className="admin-user-detail-section-title">

          <span>
            🛡️
          </span>

          <div>

            <strong>
              O que este usuário pode fazer
            </strong>

            <small>
              Capacidades associadas à função da conta.
            </small>

          </div>

        </div>


        <div className="admin-user-capabilities">

          {getUserCapabilities(selectedUser).map(
            (capability, index) => (

              <div
                className="admin-user-capability"
                key={index}
              >

                <div className="admin-user-capability-icon">
                  {capability.icon}
                </div>

                <div>

                  <strong>
                    {capability.title}
                  </strong>

                  <p>
                    {capability.description}
                  </p>

                </div>

                <span className="admin-user-capability-check">
                  ✓
                </span>

              </div>

            )
          )}

        </div>

      </div>


      {/* ATIVIDADE */}

      <div className="admin-user-detail-section">

        <div className="admin-user-detail-section-title">

          <span>
            📊
          </span>

          <div>

            <strong>
              Atividade na plataforma
            </strong>

            <small>
              Registos relacionados a este usuário.
            </small>

          </div>

        </div>


        <div className="admin-user-activity-grid">

          <div className="admin-user-activity-card">

            <span>
              📋
            </span>

            <strong>
              {
                projects.filter(
                  (project) =>
                    String(project.client_id) ===
                    String(selectedUser.id)
                ).length
              }
            </strong>

            <small>
              Projetos
            </small>

          </div>


          <div className="admin-user-activity-card">

            <span>
              🛠️
            </span>

            <strong>
              {
                services.filter(
                  (service) =>
                    String(service.provider_id) ===
                    String(selectedUser.id)
                ).length
              }
            </strong>

            <small>
              Serviços
            </small>

          </div>


          <div className="admin-user-activity-card">

            <span>
              ⭐
            </span>

            <strong>
              {
                reviews.filter(
                  (review) =>
                    String(review.provider_user_id) ===
                    String(selectedUser.id)
                ).length
              }
            </strong>

            <small>
              Avaliações
            </small>

          </div>


          <div className="admin-user-activity-card">

            <span>
              💼
            </span>

            <strong>
              —
            </strong>

            <small>
              Propostas
            </small>

          </div>

        </div>

      </div>


      {/* AÇÕES */}

      <div className="admin-user-modal-footer">

        <button
          className="admin-user-modal-secondary"
          onClick={closeUserDetails}
        >
          Fechar
        </button>


        {selectedUser.id !== user?.id && (

          <button
            className={
              selectedUser.is_active
                ? "admin-user-modal-danger"
                : "admin-user-modal-success"
            }
            onClick={async () => {

              await handleUserStatus(
                selectedUser.id
              );

              const updatedUsers =
                await getAdminUsers();

              const updated =
                updatedUsers.find(
                  (item) =>
                    String(item.id) ===
                    String(selectedUser.id)
                );

              setUsers(updatedUsers);

              if (updated) {
                setSelectedUser(updated);
              }

            }}
          >

            {selectedUser.is_active
              ? "Desativar conta"
              : "Ativar conta"}

          </button>

        )}

      </div>

    </div>

  </div>

)}

    </div>

  );

}


export default AdminDashboard;

