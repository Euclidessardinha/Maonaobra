import { useEffect, useState } from "react";

import { getProviders } from "../api/providers";
import { getCategories } from "../api/api";

import ClientLayout from "../components/ClientLayout";

import "./ClientProviders.css";

function ClientProviders() {
const params = new URLSearchParams(window.location.search);

const categoryFromUrl = params.get("category");

const [providers, setProviders] = useState([]);
const [categories, setCategories] = useState([]);

const [search, setSearch] = useState("");
const [location, setLocation] = useState("");

const [selectedCategory, setSelectedCategory] = useState(
categoryFromUrl || ""
);

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
      location: locationValue,
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
      profession: provider.profession,
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
const numericRating = Number(rating) || 0;


const roundedRating = Math.max(
  0,
  Math.min(5, Math.round(numericRating))
);

return (
  <>
    {"★".repeat(roundedRating)}
    {"☆".repeat(5 - roundedRating)}
  </>
);


}

// ==========================================
// CATEGORIA ATUAL
// ==========================================

const selectedCategoryName = selectedCategory
? categories.find(
(category) =>
String(category.id) ===
String(selectedCategory)
)?.name
: null;

return (
<ClientLayout
activePage="providers"
title={
selectedCategoryName
? `Profissionais de ${selectedCategoryName}`
: "Encontrar profissionais"
}
subtitle={
selectedCategoryName
? "Encontre profissionais especializados nesta categoria."
: "Encontre profissionais qualificados para realizar o seu projeto."
}
label="ÁREA DO CLIENTE"
> <div className="client-providers-page">


    {/* =====================================
        HERO
    ====================================== */}

    <section className="providers-hero">

      <span className="providers-hero-decoration decoration-one">
        👷
      </span>

      <span className="providers-hero-decoration decoration-two">
        🔧
      </span>

      <span className="providers-hero-decoration decoration-three">
        ✨
      </span>

      <div className="providers-hero-icon">
        👷
      </div>

      <div className="providers-hero-content">

        <span className="providers-hero-label">
          ENCONTRE O PROFISSIONAL CERTO
        </span>

        <h2>
          Encontre profissionais
          <br />
          para o seu projeto
        </h2>

        <p>
          Pesquise profissionais qualificados,
          compare experiências e encontre quem
          pode realizar o seu serviço.
        </p>

      </div>

      <div className="providers-hero-count">

        <strong>
          {providers.length}
        </strong>

        <span>
          {providers.length === 1
            ? "Profissional"
            : "Profissionais"}
        </span>

      </div>

    </section>


    {/* =====================================
        FILTROS
    ====================================== */}

    <section className="providers-search-card">

      <div className="providers-search-header">

        <div className="providers-search-icon">
          🔎
        </div>

        <div>
          <h2>
            Procurar profissionais
          </h2>

          <p>
            Use os filtros para encontrar
            o profissional ideal.
          </p>
        </div>

      </div>


      <form onSubmit={handleSearch}>

        <div className="providers-filter-grid">


          {/* PESQUISA */}

          <div className="providers-field">

            <label htmlFor="provider-search">
              🔎 O que procura?
            </label>

            <div className="providers-input-wrapper">

              <span>
                🔍
              </span>

              <input
                id="provider-search"
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

          </div>


          {/* CATEGORIA */}

          <div className="providers-field">

            <label htmlFor="provider-category">
              🏷️ Categoria
            </label>

            <div className="providers-input-wrapper">

              <span>
                📂
              </span>

              <select
                id="provider-category"
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

          </div>


          {/* LOCALIZAÇÃO */}

          <div className="providers-field">

            <label htmlFor="provider-location">
              📍 Localização
            </label>

            <div className="providers-input-wrapper">

              <span>
                📍
              </span>

              <input
                id="provider-location"
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

          </div>

        </div>


        {/* BOTÕES */}

        <div className="providers-filter-actions">

          <button
            type="submit"
            className="providers-search-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="providers-button-spinner" />
                Pesquisando...
              </>
            ) : (
              <>
                🔍 Pesquisar profissionais
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            disabled={loading}
            className="providers-clear-button"
          >
            ✕ Limpar filtros
          </button>

        </div>

      </form>

    </section>


    {/* =====================================
        ERRO
    ====================================== */}

    {error && (
      <div className="providers-error">
        <span className="providers-error-icon">
          ⚠️
        </span>

        <div>
          <strong>
            Ocorreu um problema
          </strong>

          <p>
            {error}
          </p>
        </div>
      </div>
    )}


    {/* =====================================
        LOADING
    ====================================== */}

    {loading ? (

      <section className="providers-loading">

        <div className="providers-loading-icon">
          👷
        </div>

        <div className="providers-loading-spinner" />

        <h3>
          Procurando profissionais...
        </h3>

        <p>
          Estamos a encontrar profissionais
          que correspondem à sua pesquisa.
        </p>

      </section>

    ) : providers.length === 0 ? (

      /* =====================================
         VAZIO
      ====================================== */

      <section className="providers-empty">

        <div className="providers-empty-icon">
          👷
        </div>

        <span className="providers-empty-badge">
          SEM RESULTADOS
        </span>

        <h3>
          Nenhum profissional encontrado
        </h3>

        <p>
          Não encontramos profissionais
          correspondentes aos filtros selecionados.
          Tente alterar a pesquisa ou procurar
          por outra categoria.
        </p>

        <button
          type="button"
          onClick={handleClearFilters}
          className="providers-empty-button"
        >
          🔄 Limpar filtros
        </button>

      </section>

    ) : (

      /* =====================================
         RESULTADOS
      ====================================== */

      <section className="providers-results">

        <div className="providers-results-header">

          <div>

            <span className="providers-results-label">
              PROFISSIONAIS DISPONÍVEIS
            </span>

            <h2>
              Profissionais encontrados
            </h2>

            <p>
              Encontre o profissional que
              melhor corresponde ao seu projeto.
            </p>

          </div>

          <div className="providers-results-total">

            <strong>
              {providers.length}
            </strong>

            <span>
              {providers.length === 1
                ? "resultado"
                : "resultados"}
            </span>

          </div>

        </div>


        <div className="provider-grid">

          {providers.map(
            (provider) => {

              const rating =
                Number(
                  provider.average_rating
                ) || 0;

              const experience =
                Number(
                  provider.experience_years
                ) || 0;

              return (
                <article
                  className="provider-card"
                  key={provider.id}
                >

                  {/* TOPO DO CARD */}

                  <div className="provider-card-top">

                    <div className="provider-avatar">
                      {provider.name
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}
                    </div>

                    <div className="provider-card-status">
                      <span />
                      Disponível
                    </div>

                  </div>


                  {/* INFORMAÇÕES */}

                  <div className="provider-card-content">

                    <h3>
                      {provider.name}
                    </h3>

                    <div className="provider-profession">
                      {provider.profession ||
                        "Profissional"}
                    </div>


                    <div className="provider-location">
                      <span>📍</span>

                      <span>
                        {provider.location ||
                          "Localização não informada"}
                      </span>
                    </div>


                    {/* AVALIAÇÃO */}

                    <div className="provider-rating">

                      <div className="provider-stars">
                        {renderStars(rating)}
                      </div>

                      <strong>
                        {rating > 0
                          ? rating.toFixed(1)
                          : "Novo"}
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


                    {/* ESTATÍSTICAS */}

                    <div className="provider-info-grid">

                      <div className="provider-info-item">

                        <span className="provider-info-icon">
                          💼
                        </span>

                        <div>
                          <small>
                            Experiência
                          </small>

                          <strong>
                            {experience}{" "}
                            {experience === 1
                              ? "ano"
                              : "anos"}
                          </strong>
                        </div>

                      </div>


                      {provider.hourly_rate !== null &&
                        provider.hourly_rate !== undefined && (

                          <div className="provider-info-item">

                            <span className="provider-info-icon">
                              💰
                            </span>

                            <div>
                              <small>
                                A partir de
                              </small>

                              <strong>
                                {provider.hourly_rate} MT
                                <small className="provider-rate-unit">
                                  /hora
                                </small>
                              </strong>
                            </div>

                          </div>

                        )}

                    </div>


                    {/* BOTÃO */}

                    <a
                      href={`/client/providers/${provider.id}`}
                      className="provider-profile-button"
                    >
                      <span>
                        Ver perfil
                      </span>

                      <span className="provider-profile-arrow">
                        →
                      </span>
                    </a>

                  </div>

                </article>
              );
            }
          )}

        </div>

      </section>

    )}

  </div>
</ClientLayout>


);
}

export default ClientProviders;
