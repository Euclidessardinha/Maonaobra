import { useEffect, useState } from "react";

import { getCategories } from "./api/api";

import Login from "./pages/login";
import Register from "./pages/Register";

import { useAuth } from "./context/AuthContext";

import ClientDashboard from "./pages/ClientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";

import ProviderProject from "./pages/ProviderProject";
import ClientProject from "./pages/ClientProject";

import ClientReviews from "./pages/ClientReviews";
import ProviderReviews from "./pages/ProviderReviews";

import ClientProviders from "./pages/ClientProviders";
import ClientProviderProfile from "./pages/ClientProviderProfile";

import ClientRequests from "./pages/ClientRequests";
import ClientProjectCreate from "./pages/ClientProjectCreate";

import ProviderServiceCreate from "./pages/ProviderServiceCreate";
import ProviderServices from "./pages/ProviderServices";

import ClientChat from "./pages/ClientChat";
import ProviderChat from "./pages/ProviderChat";

import ProtectedRoute from "./components/ProtectedRoute";

import CategoriesPage from "./pages/CategoriesPage";

import ProviderRoute from "./components/ProviderRoute";

import CreateProviderProfile from "./pages/CreateProviderProfile";

import AdminDashboard from "./pages/AdminDashboard";

import ProviderProjects from "./pages/ProviderProjects";

import ProviderRequests from "./pages/ProviderRequests";


import "./App.css";

import ClientFavorites from "./pages/ClientFavorites";
import ClientProfile from "./pages/ClientProfile";
import ProviderProfile from "./pages/ProviderProfile";

/* =========================================================
PÁGINA INICIAL
========================================================= */

function HomePage({
user,
loading,
logout
}) {

const [search, setSearch] = useState("");
const [location, setLocation] = useState("");

const [categories, setCategories] = useState([]);
const [loadingCategories, setLoadingCategories] = useState(true);

/* =======================================================
CARREGAR CATEGORIAS
======================================================= */

useEffect(() => {


async function loadCategories() {

  try {

    const data = await getCategories();

    setCategories(data);

  } catch (error) {

    console.error(
      "Erro ao carregar categorias:",
      error
    );

  } finally {

    setLoadingCategories(false);

  }

}

loadCategories();


}, []);

/* =======================================================
PESQUISAR PROFISSIONAIS
======================================================= */

function handleSearch(event) {


event.preventDefault();

const params = new URLSearchParams();

if (search.trim()) {

  params.set(
    "search",
    search.trim()
  );

}

if (location.trim()) {

  params.set(
    "location",
    location.trim()
  );

}

const query = params.toString();

if (query) {

  window.location.href =
    `/client/providers?${query}`;

} else {

  window.location.href =
    "/client/providers";

}


}

/* =======================================================
IR PARA A ÁREA DO UTILIZADOR
======================================================= */

function handleGoToDashboard() {


if (!user) {

  window.location.href = "/login";

  return;

}

if (user.role === "ADMIN") {
  window.location.href = "/admin";
  return;
}

if (user.is_provider) {

  window.location.href = "/provider";

  return;

}

window.location.href = "/client";


}

/* =======================================================
RENDER
======================================================= */

return (


<div className="app">


  {/* ===================================================
      NAVBAR
  =================================================== */}

  <header className="navbar">

    <div className="logo home-logo">
      <img src="/favicon-mao4.png" alt="Mao na obra" />

      <div>Mão</div><span>NaObra</span>

    </div>


    <nav>

      <a href="#inicio">
        Início
      </a>

      <a href="#servicos">
        Serviços
      </a>

      <a href="/categories">
        Categorias
      </a>

    </nav>


    <div className="nav-actions">

      {loading ? (

        <span>
          Carregando...
        </span>

      ) : user ? (

        <>

          <span className="user-name">

            Olá, {user.name}

          </span>


          <button
            type="button"
            className="register-btn"
            onClick={handleGoToDashboard}
          >
            Minha área
          </button>


          <button
            type="button"
            className="login-btn"
            onClick={logout}
          >
            Sair
          </button>

        </>

      ) : (

        <>

          <a
            href="/login"
            className="login-btn"
          >
            Entrar
          </a>


          <a
            href="/register"
            className="register-btn"
          >
            Criar conta
          </a>

        </>

      )}

    </div>

  </header>


  {/* ===================================================
      HERO
  =================================================== */}

  <section
    className="hero"
    id="inicio"
  >

    <div className="hero-content">

      <span className="hero-badge">
        🔧 Serviços perto de você
      </span>


      <h1>

        Encontre o profissional

        <br />

        certo para o seu serviço.

      </h1>


      <p>

        Conectamos clientes a profissionais
        qualificados para realizar serviços
        de forma simples, rápida e segura.

      </p>


      {/* =================================================
          PESQUISA
      ================================================= */}

      {/*<form
        className="search-box"
        onSubmit={handleSearch}
      >

        <div className="search-field">

          <span>
            🔍
          </span>

          <div>

            <small>
              O que você precisa?
            </small>

            <input
              type="text"
              placeholder="Ex: eletricista"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        <div className="search-field">

          <span>
            📍
          </span>

          <div>

            <small>
              Localização
            </small>

            <input
              type="text"
              placeholder="Ex: Beira"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
            />

          </div>

        </div>


        <button
          type="submit"
          className="search-btn"
        >
          Procurar
        </button>

      </form>
      */}


      {/* =================================================
          AÇÕES PRINCIPAIS
      ================================================= */}

      <div
        className="hero-actions"
        
      >

        <button
          type="button"
          className="register-btn"
          onClick={() => {
            window.location.href =
              "/client/providers";
          }}
        >
          🔎 Encontrar profissionais
        </button>


        {!user && (

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              window.location.href =
                "/register";
            }}
          >
            🔨 Quero ser profissional
          </button>

        )}


        {user && (

          <button
            type="button"
            className="secondary-btn"
            onClick={handleGoToDashboard}
          >
            Ir para minha área →
          </button>

        )}

      </div>

    </div>

  </section>


  {/* ===================================================
      CATEGORIAS
  =================================================== */}

  <section
    className="categories"
    id="categorias"
  >

    <div className="section-header">

      <div>

        <span className="section-label">
          EXPLORE
        </span>

        <h2>
          Encontre serviços por categoria
        </h2>

      </div>

    </div>


    <div className="category-grid">

      {loadingCategories ? (

        <p>
          Carregando categorias...
        </p>

      ) : categories.length === 0 ? (

        <p>
          Nenhuma categoria encontrada.
        </p>

      ) : (

        categories
          .slice(0, 6)
          .map((category) => (

            <a
              href={`/client/providers?category=${category.id}`}
              className="category-card"
              key={category.id}
            >

              <div className="category-icon">
                🔧
              </div>

              <h3>
                {category.name}
              </h3>

              <p>
                {category.description}
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  fontWeight: "600"
                }}
              >
                Ver profissionais →
              </span>

            </a>

          ))

      )}

    </div>


    {/* =================================================
        VER TODAS AS CATEGORIAS
    ================================================= */}

    {categories.length > 6 && (

      <div className="categories-action">

        <a
          href="/categories"
          className="view-all-btn"
        >
          Ver todas as categorias →
        </a>

      </div>

    )}

  </section>


  {/* ===================================================
      COMO FUNCIONA
  =================================================== */}

  <section
    className="how-it-works"
    id="servicos"
  >

    <span className="section-label">
      SIMPLES E RÁPIDO
    </span>

    <h2>
      Como funciona?
    </h2>


    <div className="steps">

      <div className="step">

        <div className="step-number">
          1
        </div>

        <h3>
          Procure
        </h3>

        <p>
          Encontre o serviço que você precisa.
        </p>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            window.location.href =
              "/client/providers";
          }}
        >
          Procurar profissionais
        </button>

      </div>


      <div className="step">

        <div className="step-number">
          2
        </div>

        <h3>
          Escolha
        </h3>

        <p>
          Compare profissionais e avaliações.
        </p>

      </div>


      <div className="step">

        <div className="step-number">
          3
        </div>

        <h3>
          Solicite
        </h3>

        <p>
          Envie seu pedido ao profissional.
        </p>

      </div>


      <div className="step">

        <div className="step-number">
          4
        </div>

        <h3>
          Resolva
        </h3>

        <p>
          Acompanhe o serviço até a conclusão.
        </p>

      </div>

    </div>

  </section>


  {/* ===================================================
      FOOTER
  =================================================== */}

  <footer>

    <div className="logo">
      Mão<span>NaObra</span>
    </div>

    <p>
      Conectando pessoas a profissionais.
    </p>

    <p className="copyright">
      © 2026 MãoNaObra. Todos os direitos reservados.
    </p>

  </footer>

</div>


);

}

/* =========================================================
APP PRINCIPAL
========================================================= */

function App() {

const {
user,
loading,
logout
} = useAuth();

const path =
window.location.pathname;


/* =======================================================
   LOADING INICIAL
======================================================= */

if (loading && path !== "/login" && path !== "/register") {
  return (
    <div className="app-loading">
      <div className="app-loading-logo">
        <div className="app-loading-ring"></div>

        <img
          src="/favicon-mao4.png"
          alt="MãoNaObra"
        />
      </div>
    </div>
  );
}


/* =======================================================
LOGIN
======================================================= */

if (path === "/login") {


return <Login />;


}

/* =======================================================
REGISTRO
======================================================= */

if (path === "/register") {


return <Register />;


}

/* =======================================================
CLIENTE — CRIAR PROJETO
======================================================= */

if (path === "/client/projects/new") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientProjectCreate />

  </ProtectedRoute>

);


}


/* =======================================================
   PRESTADOR — PROJETOS DISPONÍVEIS
======================================================= */

if (path === "/provider/projects") {

  return (

    <ProviderRoute>

      <ProviderProjects />

    </ProviderRoute>

  );

}


/* =======================================================
CLIENTE — PROJETO
======================================================= */

if (path.startsWith("/client/projects/")) {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientProject />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — PROFISSIONAIS
======================================================= */

if (path === "/client/providers") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientProviders />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — PERFIL DO PROFISSIONAL
======================================================= */

if (path.startsWith("/client/providers/")) {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientProviderProfile />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — SOLICITAÇÕES
======================================================= */

if (path === "/client/requests") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientRequests />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — FAVORITOS
======================================================= */

if (path === "/client/favorites") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientFavorites />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — CHAT
======================================================= */

if (path === "/client/chat") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientChat />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — AVALIAÇÕES
======================================================= */

if (path === "/client/reviews") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientReviews />

  </ProtectedRoute>

);


}

/* =======================================================
ADMIN
======================================================= */

if (path === "/admin") {


return (

  <ProtectedRoute
    allowedRoles={["ADMIN"]}
  >

    <AdminDashboard />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — PERFIL
======================================================= */

if (path === "/client/profile") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientProfile />

  </ProtectedRoute>

);


}

/* =======================================================
CLIENTE — DASHBOARD
======================================================= */

if (path === "/client") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <ClientDashboard />

  </ProtectedRoute>

);


}

/* =======================================================
PROVIDER — CRIAR PERFIL PROFISSIONAL
======================================================= */

if (path === "/provider/profile/create") {


return (

  <ProtectedRoute
    allowedRoles={["CLIENT"]}
  >

    <CreateProviderProfile />

  </ProtectedRoute>

);


}



/* =======================================================
PROVIDER — MEU PERFIL PROFISSIONAL
======================================================= */

if (path === "/provider/profile") {

  return (

    <ProviderRoute>

      <ProviderProfile />

    </ProviderRoute>

  );

}




/* =======================================================
PROVIDER — PEDIDOS RECEBIDOS
======================================================= */

if (path === "/provider/requests") {

return (


<ProviderRoute>

  <ProviderRequests />

</ProviderRoute>


);

}



/* =======================================================
PROVIDER — PROJETO
======================================================= */

if (path.startsWith("/provider/projects/")) {


return (

  <ProviderRoute>

    <ProviderProject />

  </ProviderRoute>

);


}

/* =======================================================
PROVIDER — AVALIAÇÕES
======================================================= */

if (path === "/provider/reviews") {


return (

  <ProviderRoute>

    <ProviderReviews />

  </ProviderRoute>

);


}

/* =======================================================
PROVIDER — MEUS SERVIÇOS
======================================================= */

if (path === "/provider/services") {


return (

  <ProviderRoute>

    <ProviderServices />

  </ProviderRoute>

);


}

/* =======================================================
PROVIDER — CRIAR SERVIÇO
======================================================= */

if (path === "/provider/services/new") {


return (

  <ProviderRoute>

    <ProviderServiceCreate />

  </ProviderRoute>

);


}

/* =======================================================
PROVIDER — CHAT
======================================================= */

if (path === "/provider/chat") {


return (

  <ProviderRoute>

    <ProviderChat />

  </ProviderRoute>

);


}

/* =======================================================
PROVIDER — DASHBOARD
======================================================= */

if (path === "/provider") {


return (

  <ProviderRoute>

    <ProviderDashboard />

  </ProviderRoute>

);


}

/* =======================================================
CATEGORIAS
======================================================= */

if (path === "/categories") {


return <CategoriesPage />;


}

/* =======================================================
PÁGINA INICIAL
======================================================= */

return (


<HomePage
  user={user}
  loading={loading}
  logout={logout}
/>


);

}

export default App;
