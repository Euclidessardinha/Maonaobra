import { useEffect, useState } from "react";

import ClientLayout from "../components/ClientLayout";
import {
getMyFavorites,
removeFavorite
} from "../api/favorites";

import "./ClientFavorites.css";

function ClientFavorites() {
const [favorites, setFavorites] = useState([]);
const [loading, setLoading] = useState(true);
const [removingId, setRemovingId] = useState(null);
const [error, setError] = useState("");

useEffect(() => {
loadFavorites();
}, []);

async function loadFavorites() {
try {
setLoading(true);
setError("");


  const data = await getMyFavorites();

  setFavorites(Array.isArray(data) ? data : []);
} catch (err) {
  console.error("Erro ao carregar favoritos:", err);

  setError(
    err?.message ||
    "Não foi possível carregar os seus favoritos."
  );
} finally {
  setLoading(false);
}


}

async function handleRemoveFavorite(providerId, favoriteId) {
try {
setRemovingId(favoriteId);
setError("");


  await removeFavorite(providerId);

  setFavorites((current) =>
    current.filter(
      (favorite) => favorite.id !== favoriteId
    )
  );
} catch (err) {
  console.error("Erro ao remover favorito:", err);

  setError(
    err?.message ||
    "Não foi possível remover este prestador dos favoritos."
  );
} finally {
  setRemovingId(null);
}


}

function getInitial(name) {
if (!name) return "P";


return name
  .trim()
  .charAt(0)
  .toUpperCase();


}

function formatPrice(price) {
if (price === null || price === undefined || price === "") {
return "Preço não informado";
}


const numericPrice = Number(price);

if (Number.isNaN(numericPrice)) {
  return "Preço não informado";
}

return `${numericPrice.toLocaleString("pt-MZ")} MT/h`;


}

return (
<ClientLayout
activePage="favorites"
title="Meus favoritos"
subtitle="Guarde os profissionais que pretende contratar mais tarde."
label="ÁREA DO CLIENTE"
action={
<button
type="button"
className="favorites-header-action"
onClick={() => {
window.location.href = "/client/providers";
}}
> <span>🔎</span>
Procurar profissionais </button>
}
> <section className="favorites-page">


    <div className="favorites-hero">
      <div className="favorites-hero-icon">
        ❤️
      </div>

      <div className="favorites-hero-content">
        <span className="favorites-eyebrow">
          PROFISSIONAIS GUARDADOS
        </span>

        <h2>
          Os seus profissionais favoritos
        </h2>

        <p>
          Tenha acesso rápido aos profissionais que mais
          interessaram e encontre facilmente quem pretende contratar.
        </p>
      </div>

      <div className="favorites-hero-count">
        <strong>{favorites.length}</strong>
        <span>
          {favorites.length === 1
            ? "favorito"
            : "favoritos"}
        </span>
      </div>
    </div>


    {error && (
      <div className="favorites-alert">
        <div className="favorites-alert-icon">
          !
        </div>

        <div>
          <strong>Ocorreu um problema</strong>
          <p>{error}</p>
        </div>

        <button
          type="button"
          onClick={loadFavorites}
        >
          Tentar novamente
        </button>
      </div>
    )}


    {loading ? (
      <div className="favorites-loading">
        <div className="favorites-spinner"></div>

        <h3>A carregar favoritos...</h3>

        <p>
          Estamos a procurar os profissionais que guardou.
        </p>
      </div>
    ) : favorites.length === 0 ? (
      <div className="favorites-empty">
        <div className="favorites-empty-icon">
          ♡
        </div>

        <h3>
          Ainda não tem favoritos
        </h3>

        <p>
          Quando encontrar um profissional que pretende
          guardar, adicione-o aos favoritos para encontrá-lo
          rapidamente depois.
        </p>

        <button
          type="button"
          className="favorites-primary-button"
          onClick={() => {
            window.location.href = "/client/providers";
          }}
        >
          <span>🔎</span>
          Procurar profissionais
        </button>
      </div>
    ) : (
      <div className="favorites-content">

        <div className="favorites-section-heading">
          <div>
            <span>GUARDADOS</span>

            <h3>
              Profissionais que você guardou
            </h3>
          </div>

          <div className="favorites-total">
            {favorites.length}{" "}
            {favorites.length === 1
              ? "profissional"
              : "profissionais"}
          </div>
        </div>


        <div className="favorites-grid">
          {favorites.map((favorite) => {
            const provider = favorite.provider;

            if (!provider) {
              return null;
            }

            return (
              <article
                className="favorite-card"
                key={favorite.id}
              >
                <div className="favorite-card-top">

                  <div className="favorite-avatar">
                    {getInitial(provider.name)}
                  </div>

                  <div className="favorite-card-identity">
                    <div className="favorite-name-row">
                      <h3>
                        {provider.name}
                      </h3>

                      {provider.is_verified && (
                        <span
                          className="favorite-verified"
                          title="Prestador verificado"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <p>
                      {provider.profession ||
                        "Profissional"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="favorite-remove-button"
                    title="Remover dos favoritos"
                    disabled={removingId === favorite.id}
                    onClick={() =>
                      handleRemoveFavorite(
                        provider.id,
                        favorite.id
                      )
                    }
                  >
                    {removingId === favorite.id
                      ? "..."
                      : "♥"}
                  </button>
                </div>


                <div className="favorite-card-info">

                  <div className="favorite-info-item">
                    <span className="favorite-info-icon">
                      📍
                    </span>

                    <div>
                      <small>Localização</small>
                      <strong>
                        {provider.location ||
                          "Não informada"}
                      </strong>
                    </div>
                  </div>


                  <div className="favorite-info-item">
                    <span className="favorite-info-icon">
                      💼
                    </span>

                    <div>
                      <small>Experiência</small>
                      <strong>
                        {provider.experience_years ?? 0}{" "}
                        {Number(provider.experience_years) === 1
                          ? "ano"
                          : "anos"}
                      </strong>
                    </div>
                  </div>


                  <div className="favorite-info-item">
                    <span className="favorite-info-icon">
                      💰
                    </span>

                    <div>
                      <small>Preço</small>
                      <strong>
                        {formatPrice(
                          provider.hourly_rate
                        )}
                      </strong>
                    </div>
                  </div>

                </div>


                <div className="favorite-card-footer">

                  {provider.is_verified ? (
                    <span className="favorite-status verified">
                      <span>✓</span>
                      Prestador verificado
                    </span>
                  ) : (
                    <span className="favorite-status">
                      Prestador
                    </span>
                  )}

                  <button
                    type="button"
                    className="favorite-profile-button"
                    onClick={() => {
                      window.location.href =
                        `/client/providers/${provider.id}`;
                    }}
                  >
                    Ver perfil
                    <span>→</span>
                  </button>

                </div>
              </article>
            );
          })}
        </div>

      </div>
    )}

  </section>
</ClientLayout>


);
}

export default ClientFavorites;
