import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import { getProviders } from "../api/providers";

import { getCategories } from "../api/api";


function ClientProviders() {

    const params = new URLSearchParams(window.location.search);

  const categoryFromUrl = params.get("category");

  const { logout } = useAuth();

  const [providers, setProviders] = useState([]);

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [location, setLocation] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================================
  // CARREGAR CATEGORIAS
  // ==========================================

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

        setError(
          error.message ||
          "Erro ao carregar categorias."
        );

      }

    }

    loadCategories();

  }, []);


  // ==========================================
  // BUSCAR PROFISSIONAIS
  // ==========================================

  async function loadProviders(
    searchValue = search,
    categoryValue = selectedCategory,
    locationValue = location
  ) {

    try {

      setLoading(true);
      setError("");

      console.log(
        "Buscando profissionais:",
        {
          search: searchValue,
          category: categoryValue || "TODAS",
          location: locationValue
        }
      );

      const data = await getProviders(
        searchValue,
        categoryValue || null,
        locationValue
      );

      console.log(
        "Profissionais recebidos:",
        data.map((provider) => ({
          id: provider.id,
          name: provider.name,
          profession: provider.profession
        }))
      );

      setProviders(data);

    } catch (error) {

      console.error(
        "Erro ao carregar profissionais:",
        error
      );

      setError(
        error.message ||
        "Erro ao carregar profissionais."
      );

      setProviders([]);

    } finally {

      setLoading(false);

    }

  }


  // ==========================================
  // CARREGAMENTO INICIAL
  // ==========================================

  useEffect(() => {

    loadProviders(
      "",
      categoryFromUrl || "",
      ""
    );

  }, []);


  // ==========================================
  // PESQUISAR
  // ==========================================

  function handleSearch(event) {

    event.preventDefault();

    loadProviders(
      search,
      selectedCategory,
      location
    );

  }


  // ==========================================
  // LIMPAR FILTROS
  // ==========================================

  function handleClearFilters() {

    setSearch("");

    setSelectedCategory("");

    setLocation("");

    window.history.replaceState(
      {},
      "",
      "/client/providers"
    );

    loadProviders(
      "",
      "",
      ""
    );

  }


  // ==========================================
  // ESTRELAS
  // ==========================================

  function renderStars(rating) {

    const roundedRating =
      Math.round(rating);

    return (
      <>
        {"⭐".repeat(roundedRating)}
        {"☆".repeat(5 - roundedRating)}
      </>
    );

  }


  return (

    <div className="dashboard">


      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="logo">
          Mão<span>NaObra</span>
        </div>


        <nav>

          <a href="/client">
            🏠 Visão geral
          </a>

          <a href="/client/projects">
            📁 Meus projetos
          </a>

          <a href="/client/providers">
            👷 Encontrar profissionais
          </a>

          <a href="/client/reviews">
            ⭐ Minhas avaliações
          </a>

        </nav>


        <button
          onClick={logout}
          className="sidebar-logout"
        >
          Sair
        </button>

      </aside>


      {/* =====================================
          MAIN
      ====================================== */}

      <main className="dashboard-content">


        {/* ===================================
            HEADER
        ==================================== */}

        <div className="dashboard-header">

          <div>

            <span className="section-label">
              PROFISSIONAIS
            </span>

            <h1>
              {selectedCategory
                ? `Profissionais de ${
                    categories.find(
                      (category) =>
                        String(category.id) ===
                        String(selectedCategory)
                    )?.name || "esta categoria"
                  }`
                : "Encontre profissionais 👷"}
            </h1>

            <p>
              {selectedCategory
                ? "Encontre profissionais especializados nesta categoria."
                : "Encontre profissionais qualificados para realizar o seu projeto."}
            </p>

          </div>

        </div>


        {/* ===================================
            FILTROS
        ==================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Procurar profissionais
              </h2>

              <p>
                Encontre o profissional ideal
                através dos filtros abaixo.
              </p>

            </div>

          </div>


          <form
            onSubmit={handleSearch}
          >


            {/* PESQUISA */}

            <div className="form-group">

              <label>
                🔎 O que procura?
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Ex: eletricista, pedreiro, designer..."
              />

            </div>


            {/* CATEGORIA */}

            <div className="form-group">

              <label>
                🏷️ Categoria
              </label>

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Todas as categorias
                </option>


                {categories.map(
                  (category) => (

                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* LOCALIZAÇÃO */}

            <div className="form-group">

              <label>
                📍 Localização
              </label>

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="Ex: Beira, Nampula, Maputo..."
              />

            </div>


            {/* BOTÕES */}

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "20px"
              }}
            >

              <button
                type="submit"
                className="register-btn"
                disabled={loading}
              >
                {loading
                  ? "Pesquisando..."
                  : "🔍 Pesquisar"}
              </button>


              <button
                type="button"
                onClick={handleClearFilters}
                disabled={loading}
                className="secondary-btn"
              >
                ✕ Limpar filtros
              </button>

            </div>


          </form>

        </section>


        {/* ===================================
            ERRO
        ==================================== */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* ===================================
            LOADING
        ==================================== */}

        {loading ? (

          <div className="empty-state">

            <h3>
              Procurando profissionais...
            </h3>

          </div>

        ) : providers.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              👷
            </div>

            <h3>
              Nenhum profissional encontrado
            </h3>

            <p>
              Tente alterar os filtros
              ou procurar por outra categoria.
            </p>

          </div>

        ) : (

          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Profissionais encontrados
                </h2>

                <p>
                  {providers.length}{" "}
                  {providers.length === 1
                    ? "profissional encontrado"
                    : "profissionais encontrados"}
                </p>

              </div>

            </div>


            <div className="provider-grid">

              {providers.map(
                (provider) => (

                  <div
                    className="provider-card"
                    key={provider.id}
                  >

                    <div className="provider-card-icon">
                      👤
                    </div>


                    <div className="provider-card-content">

                      <h2>
                        {provider.name}
                      </h2>

                      <h3>
                        {provider.profession}
                      </h3>


                      <p>
                        📍 {provider.location}
                      </p>


                      <p>
                        💼{" "}
                        {provider.experience_years}{" "}
                        {provider.experience_years === 1
                          ? "ano"
                          : "anos"}{" "}
                        de experiência
                      </p>


                      {/* AVALIAÇÕES */}

                      <div className="provider-rating">

                        <span className="stars">

                          {renderStars(
                            provider.average_rating
                          )}

                        </span>

                        <strong>

                          {provider.average_rating > 0
                            ? provider.average_rating
                            : "Sem avaliações"}

                        </strong>


                        {provider.total_reviews > 0 && (

                          <span>

                            ({provider.total_reviews}{" "}

                            {provider.total_reviews === 1
                              ? "avaliação"
                              : "avaliações"})

                          </span>

                        )}

                      </div>


                      {/* PREÇO */}

                      {provider.hourly_rate !== null &&
                      provider.hourly_rate !== undefined && (

                        <p className="provider-price">

                          💰{" "}
                          {provider.hourly_rate}
                          {" "}MT/hora

                        </p>

                      )}


                      {/* PERFIL */}

                      <a
                        href={`/client/providers/${provider.id}`}
                        className="register-btn"
                      >
                        Ver perfil
                      </a>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}

      </main>

    </div>

  );

}


export default ClientProviders;