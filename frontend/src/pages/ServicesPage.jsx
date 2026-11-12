
import { useEffect, useMemo, useState } from "react";
import { getServices } from "../api/api";
import "./ServicesPage.css";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadServices() {
      try {
        const data = await getServices();

        console.log(
  "SERVIÇOS RECEBIDOS DA API:",
  data.map((service) => ({
    id: service.id,
    title: service.title,
    is_promoted: service.is_promoted,
    promotion: service.promotion,
  }))
);

        if (mounted) {
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);

        if (mounted) {
          setError("Não foi possível carregar os serviços. Tente novamente.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadServices();

    return () => {
      mounted = false;
    };
  }, []);



  const categories = useMemo(() => {
    return [...new Set(
      services
        .map((service) => service.category?.name)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "pt"));
  }, [services]);

  const locations = useMemo(() => {
    return [...new Set(
      services
        .map((service) => service.provider?.location)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "pt"));
  }, [services]);

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return services
      .filter((service) => {
        const searchableText = [
          service.title,
          service.description,
          service.category?.name,
          service.provider?.profession,
          service.provider?.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !term || searchableText.includes(term);

        const matchesCategory =
          !category || service.category?.name === category;

        const matchesLocation =
          !location || service.provider?.location === location;

        return matchesSearch && matchesCategory && matchesLocation;
      })
      .sort((a, b) => Number(Boolean(b.is_promoted)) - Number(Boolean(a.is_promoted)));
  }, [services, search, category, location]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setLocation("");
  }

  return (
    <main className="services-page">
      <header className="services-page-header">
        <a href="/" className="services-back-link">
          ← Voltar ao início
        </a>

        <span className="services-page-label">MÃO NA OBRA</span>
        <h1>Todos os serviços</h1>
        <p>
          Descubra serviços e encontre profissionais para aquilo de que precisa.
        </p>
      </header>

      <section className="services-filter-section">
        <div className="services-search-field">
          <span>🔍</span>
          <input
            type="search"
            placeholder="Pesquisar serviço, descrição ou profissional..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="services-filter-controls">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="">Todas as localizações</option>
            {locations.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <button type="button" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>
      </section>

      <section className="services-results">
        <div className="services-results-header">
          <div>
            <h2>Serviços disponíveis</h2>
            <p>Encontre a solução certa para o que procura.</p>
          </div>

          {!loading && (
            <span className="services-result-count">
              {filteredServices.length} serviço(s)
            </span>
          )}
        </div>

        {loading ? (
          <p className="services-empty">A carregar serviços...</p>
        ) : error ? (
          <p className="services-empty services-error">{error}</p>
        ) : filteredServices.length === 0 ? (
          <div className="services-empty">
            <span>🔎</span>
            <h3>Nenhum serviço encontrado</h3>
            <p>Experimente alterar a pesquisa ou os filtros.</p>
            <button type="button" onClick={clearFilters}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="all-services-grid">
            {filteredServices.map((service) => (
              <article
  className={`all-service-card ${
    service.is_promoted ? "all-service-card-promoted" : ""
  }`}
  key={service.id}
>
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="all-service-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="all-service-placeholder">🔧</div>
                )}

                <div className="all-service-content">
                  {service.is_promoted && (
                    <span className="all-service-promoted">
                      ★ EM DESTAQUE
                    </span>
                  )}

                  <span className="all-service-category">
                    {service.category?.name || "Serviço"}
                  </span>

                  <h3>{service.title}</h3>

                  <p className="all-service-description">
                    {service.description || "Sem descrição disponível."}
                  </p>

                  <div className="all-service-info">
                    <span>
                      👤 {service.provider?.profession || "Profissional"}
                    </span>
                    <span>
                      📍 {service.provider?.location || "Localização não indicada"}
                    </span>
                  </div>

                  <div className="all-service-price">
                    {service.price != null
                      ? `${Number(service.price).toLocaleString("pt-MZ")} MT`
                      : "Preço sob consulta"}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
