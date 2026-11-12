import { useEffect, useState } from "react";

import { getCategories, getServices } from "./api/api";

import Login from "./pages/login";
import Register from "./pages/Register";

import ServicesPage from "./pages/ServicesPage";

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
import Onboarding from "./pages/Onboarding";


import "./App.css";

import ClientFavorites from "./pages/ClientFavorites";
import ClientProfile from "./pages/ClientProfile";
import ProviderProfile from "./pages/ProviderProfile";



const showcaseSlides = [
  {
    title: "Instalações elétricas",
    subtitle: "Eletricistas para instalações, manutenção e reparações.",
    category: "ELETRICIDADE",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Canalização profissional",
    subtitle: "Soluções para tubagens, torneiras e sistemas de água.",
    category: "CANALIZAÇÃO",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Pintura de edifícios",
    subtitle: "Transforme os seus espaços com serviços de pintura.",
    category: "PINTURA",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Carpintaria e mobiliário",
    subtitle: "Trabalhos em madeira, portas, móveis e acabamentos.",
    category: "CARPINTARIA",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Construção civil",
    subtitle: "Profissionais para obras, remodelações e construção.",
    category: "CONSTRUÇÃO",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Limpeza profissional",
    subtitle: "Serviços de limpeza para casas, escritórios e empresas.",
    category: "LIMPEZA",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Jardinagem e paisagismo",
    subtitle: "Cuidados com jardins, espaços verdes e exteriores.",
    category: "JARDINAGEM",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Reparação automóvel",
    subtitle: "Mecânicos para manutenção e reparação de veículos.",
    category: "MECÂNICA",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Climatização e ar condicionado",
    subtitle: "Instalação e manutenção de equipamentos de climatização.",
    category: "CLIMATIZAÇÃO",
    image: "https://images.unsplash.com/photo-1631545806609-7d1c2f4a7c7e?auto=format&fit=crop&w=1800&q=85"
  },
  {
    title: "Decoração de interiores",
    subtitle: "Dê personalidade aos seus espaços com profissionais especializados.",
    category: "DECORAÇÃO",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85"
  }
];



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
const [services, setServices] = useState([]);
const [loadingServices, setLoadingServices] = useState(true);

const [activeSlide, setActiveSlide] = useState(0);


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

// Transição automática das imagens
useEffect(() => {
  const timer = window.setInterval(() => {
    setActiveSlide((current) =>
      (current + 1) % showcaseSlides.length
    );
  }, 5500);

  return () => window.clearInterval(timer);
}, []);

/* =======================================================
CARREGAR SERVIÇOS
======================================================= */

useEffect(() => {
  async function loadServices() {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setLoadingServices(false);
    }
  }

  loadServices();
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

// Colocar serviços promovidos primeiro
const orderedServices = [...services].sort(
  (a, b) =>
    Number(Boolean(b.is_promoted)) -
    Number(Boolean(a.is_promoted))
);


const currentShowcase = showcaseSlides[activeSlide];

function nextShowcase() {
  setActiveSlide((current) =>
    (current + 1) % showcaseSlides.length
  );
}

function previousShowcase() {
  setActiveSlide((current) =>
    (current - 1 + showcaseSlides.length) % showcaseSlides.length
  );
}


// Fotografias dos serviços publicados
const carouselServices = services
  .filter((service) => service.image_url)
  .slice(0, 8);

// Serviço atualmente apresentado
const activeCarouselService =
  carouselServices[activeSlide] || carouselServices[0];

// Transição automática a cada 5 segundos
useEffect(() => {
  if (carouselServices.length <= 1) {
    setActiveSlide(0);
    return;
  }

  const timer = window.setInterval(() => {
    setActiveSlide((current) => (current + 1) % carouselServices.length);
  }, 5000);

  return () => window.clearInterval(timer);
}, [carouselServices.length]);

function nextSlide() {
  setActiveSlide((current) =>
    (current + 1) % carouselServices.length
  );
}

function previousSlide() {
  setActiveSlide((current) =>
    (current - 1 + carouselServices.length) % carouselServices.length
  );
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
          .slice(0, 2)
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


    {/* =======================================  ==========
        VER TODAS AS CATEGORIAS
    ================================================= */}

    {categories.length > 2 && (

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
    CARROSSEL DE SERVIÇOS
=================================================== */}

<section className="service-showcase">

  <div className="showcase-header">
    <span className="section-label">MÃO NA OBRA</span>
    <h2>Há sempre um profissional para ajudar.</h2>
    <p>
      Descubra alguns dos serviços disponíveis na nossa plataforma.
    </p>
  </div>

  {loadingServices ? (

    <p className="showcase-message">A carregar imagens...</p>

  ) : activeCarouselService ? (

    <div className="showcase-carousel">

      <img
        key={activeCarouselService.id}
        src={activeCarouselService.image_url}
        alt={activeCarouselService.title}
        className="showcase-image"
      />

      <div className="showcase-overlay">

        <span className="showcase-tag">
          DESCUBRA OS NOSSOS SERVIÇOS
        </span>

        <h2>{activeCarouselService.title}</h2>

        <p>
          {activeCarouselService.category?.name || "Serviços profissionais"}
        </p>

        <a href="/servicos" className="showcase-button">
          Explorar serviços →
        </a>

      </div>

      {carouselServices.length > 1 && (
        <>
          <button
            type="button"
            className="showcase-arrow showcase-prev"
            onClick={previousSlide}
            aria-label="Imagem anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className="showcase-arrow showcase-next"
            onClick={nextSlide}
            aria-label="Imagem seguinte"
          >
            ›
          </button>

          <div className="showcase-dots">

            {carouselServices.map((service, index) => (
              <button
                type="button"
                key={service.id}
                className={`showcase-dot ${
                  activeSlide === index ? "active" : ""
                }`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Mostrar imagem ${index + 1}`}
              />
            ))}

          </div>
        </>
      )}

    </div>

  ) : (

    <div className="showcase-message">
      <p>
        As fotografias dos serviços aparecerão aqui à medida
        que os profissionais publicarem os seus serviços.
      </p>
    </div>

  )}

</section>




{/* ===================================================
    GALERIA DE SERVIÇOS
=================================================== */}

<section className="service-showcase">

  <div className="showcase-header">

    <span className="section-label">
      O QUE PODE ENCONTRAR
    </span>

    <h2>Temos profissionais para diferentes necessidades.</h2>

    <p>
      Descubra algumas das áreas de serviços disponíveis
      no MãoNaObra.
    </p>

  </div>

  <div className="showcase-carousel">

    <img
      key={currentShowcase.image}
      src={currentShowcase.image}
      alt={currentShowcase.category}
      className="showcase-image"
    />

    <div className="showcase-overlay">

      <span className="showcase-tag">
        {currentShowcase.category}
      </span>

      <h2>{currentShowcase.title}</h2>

      <p>{currentShowcase.subtitle}</p>

      <a href="/servicos" className="showcase-button">
        Explorar serviços →
      </a>

    </div>

    <button
      type="button"
      className="showcase-arrow showcase-prev"
      onClick={previousShowcase}
      aria-label="Imagem anterior"
    >
      ‹
    </button>

    <button
      type="button"
      className="showcase-arrow showcase-next"
      onClick={nextShowcase}
      aria-label="Imagem seguinte"
    >
      ›
    </button>

    <div className="showcase-dots">

      {showcaseSlides.map((slide, index) => (

        <button
          type="button"
          key={slide.category}
          className={`showcase-dot ${
            activeSlide === index ? "active" : ""
          }`}
          onClick={() => setActiveSlide(index)}
          aria-label={`Mostrar ${slide.category}`}
        />

      ))}

    </div>

  </div>

</section>





{/* ===================================================
    SERVIÇOS EM DESTAQUE
=================================================== */}

<section className="home-services" id="servicos">

  <div className="section-header">
    <div>
      <span className="section-label">
        DESCUBRA
      </span>

      <h2>Serviços em Destaque</h2>

      <p>
        Encontre profissionais disponíveis para realizar
        os serviços de que precisa.
      </p>
    </div>
  </div>

  {loadingServices ? (

    <p className="services-message">
      Carregando serviços...
    </p>

  ) : services.length === 0 ? (

    <p className="services-message">
      Ainda não existem serviços disponíveis.
    </p>

  ) : (

    <div className="home-service-grid">

      {orderedServices.slice(0, 6).map((service) => (

        <article
  className={`home-service-card ${
    service.is_promoted ? "home-service-card-promoted" : ""
  }`}
  key={service.id}
>

          {service.image_url ? (

            <img
              src={service.image_url}
              alt={service.title}
              className="home-service-image"
            />

          ) : (

            <div className="home-service-placeholder">
              🔧
            </div>

          )}

          <div className="home-service-content">

            {service.is_promoted && (
              <span className="promoted-badge">
                ★ EM DESTAQUE
              </span>
            )}

            <span className="home-service-category">
              {service.category?.name}
            </span>

            <h3>{service.title}</h3>

            <p className="home-service-description">
              {service.description}
            </p>

            <div className="home-service-provider">
              <span>
                {service.provider?.profession}
              </span>

              <span>
                📍 {service.provider?.location}
              </span>
            </div>

            <div className="home-service-footer">

              <strong>
                {Number(service.price).toLocaleString("pt-MZ")} MT
              </strong>

              <a href="/client/providers">
                Encontrar profissional →
              </a>

            </div>

          </div>

        </article>

      ))}

    </div>

  )}

  {services.length > 0 && (

  <div className="home-services-action">
    <a
      href="/servicos"
      className="view-all-btn"
    >
      Ver todos os serviços →
    </a>
  </div>

)}

</section>



  {/* ===================================================
      COMO FUNCIONA
  =================================================== */}

  <section
    className="how-it-works"
    id="como-funciona"
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
CATÁLOGO PÚBLICO DE SERVIÇOS
======================================================= */

if (path === "/servicos") {
  return <ServicesPage />;
}


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
ONBOARDING — ESCOLHA E CONFIGURAÇÃO DAS ÁREAS
======================================================= */

if (user && user.role !== "ADMIN") {

  // Nova conta: ainda não escolheu entre Cliente e Prestador.
  const firstChoicePending =
    user.onboarding_type == null &&
    user.client_onboarding_completed === false &&
    user.provider_onboarding_completed === false;

  if (firstChoicePending) {
    return <Onboarding />;
  }

  // Cliente: apresentar o onboarding enquanto não estiver concluído.
  if (
    user.client_onboarding_completed === false &&
    (
      path.startsWith("/client") ||
      path === "/onboarding/client"
    )
  ) {
    return <Onboarding />;
  }

  // Prestador: apresentar o onboarding enquanto não estiver concluído.
  // A criação do perfil profissional deve continuar acessível.
  if (
    user.provider_onboarding_completed === false &&
    (
      path.startsWith("/provider") ||
      path === "/onboarding/provider"
    ) &&
    path !== "/provider/profile/create"
  ) {
    return <Onboarding />;
  }

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
