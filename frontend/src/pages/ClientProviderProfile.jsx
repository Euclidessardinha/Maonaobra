import { useEffect, useState } from "react";

import { getProviderById } from "../api/providers";
import { getProviderReviews } from "../api/provider";
import { getServices } from "../api/provider";
import { createServiceRequest } from "../api/requests";
import { createConversation } from "../api/chat";

import {
getMyFavorites,
addFavorite,
removeFavorite
} from "../api/favorites";

import ClientLayout from "../components/ClientLayout";

import "./ClientProviderProfile.css";

function ClientProviderProfile() {
// =========================
// ID DO PROFISSIONAL
// =========================

const path = window.location.pathname;
const id = path.split("/").filter(Boolean).pop();

// =========================
// ESTADOS
// =========================

const [services, setServices] = useState([]);
const [provider, setProvider] = useState(null);
const [reviews, setReviews] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [selectedService, setSelectedService] = useState(null);
const [description, setDescription] = useState("");
const [location, setLocation] = useState("");

const [startingChat, setStartingChat] = useState(false);
const [chatError, setChatError] = useState("");

const [requestedDate, setRequestedDate] = useState("");

const [submitting, setSubmitting] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

// =========================
// FAVORITOS
// =========================

const [isFavorited, setIsFavorited] = useState(false);
const [favoriteLoading, setFavoriteLoading] = useState(false);
const [favoriteError, setFavoriteError] = useState("");

// =========================
// CARREGAR PROFISSIONAL
// =========================

useEffect(() => {
async function loadProvider() {
try {
setLoading(true);
setError("");


    const selectedProvider = await getProviderById(id);

    setProvider(selectedProvider);

    // =========================
    // AVALIAÇÕES
    // =========================

    const reviewData = await getProviderReviews(
      selectedProvider.id
    );

    setReviews(reviewData.reviews || []);

    // =========================
    // SERVIÇOS
    // =========================

    const allServices = await getServices();

    const providerServices = allServices.filter(
      (service) =>
        service.provider?.id === selectedProvider.id
    );

    setServices(providerServices);

    // =========================
    // VERIFICAR FAVORITO
    // =========================

    try {
      const favorites = await getMyFavorites();

      const alreadyFavorited = favorites.some(
        (favorite) =>
          favorite.provider?.id === selectedProvider.id
      );

      setIsFavorited(alreadyFavorited);
    } catch (favoriteErr) {
      console.error(
        "Erro ao verificar favorito:",
        favoriteErr
      );

      setIsFavorited(false);
    }
  } catch (err) {
    console.error(
      "Erro ao carregar profissional:",
      err
    );

    setError(
      err.message ||
      "Erro ao carregar profissional."
    );
  } finally {
    setLoading(false);
  }
}

loadProvider();


}, [id]);

// =========================
// INICIAIS DO PROFISSIONAL
// =========================

function getProviderInitials(name) {
if (!name) {
return "P";
}


const parts = name
  .trim()
  .split(/\s+/)
  .filter(Boolean);

if (parts.length === 1) {
  return parts[0].charAt(0).toUpperCase();
}

return (
  parts[0].charAt(0) +
  parts[parts.length - 1].charAt(0)
).toUpperCase();


}

// =========================
// FAVORITAR / DESFAVORITAR
// =========================

async function handleToggleFavorite() {
if (!provider || favoriteLoading) {
return;
}


try {
  setFavoriteLoading(true);
  setFavoriteError("");

  if (isFavorited) {
    await removeFavorite(provider.id);
    setIsFavorited(false);
  } else {
    await addFavorite(provider.id);
    setIsFavorited(true);
  }
} catch (err) {
  console.error(
    "Erro ao atualizar favorito:",
    err
  );

  setFavoriteError(
    err.message ||
    "Não foi possível atualizar os favoritos."
  );
} finally {
  setFavoriteLoading(false);
}


}

// =========================
// INICIAR CHAT
// =========================

async function handleStartChat() {
console.log("BOTAO DE CHAT CLICADO");


if (!provider) {
  return;
}

try {
  setStartingChat(true);
  setChatError("");

  const conversation = await createConversation(
    provider.id
  );

  window.location.href =
    `/client/chat?conversation=${conversation.id}`;
} catch (error) {
  console.error(
    "Erro ao iniciar conversa:",
    error
  );

  setChatError(
    error.message ||
    "Erro ao iniciar conversa."
  );
} finally {
  setStartingChat(false);
}


}

// =========================
// LOADING
// =========================

if (loading) {
return ( <ClientLayout
     activePage="providers"
     title="Perfil do profissional"
     subtitle="Estamos a carregar as informações deste profissional."
   > <div className="provider-profile-page-state"> <div className="provider-profile-loading-card"> <div className="provider-profile-spinner"></div>


        <h2>
          Carregando perfil...
        </h2>

        <p>
          Estamos a buscar as informações deste profissional.
        </p>
      </div>
    </div>
  </ClientLayout>
);


}

// =========================
// ERROR
// =========================

if (error || !provider) {
return ( <ClientLayout
     activePage="providers"
     title="Perfil do profissional"
     subtitle="Informações do profissional"
   > <div className="provider-profile-page-state"> <div className="provider-profile-error-card"> <div className="provider-profile-error-icon">
! </div>


        <h2>
          Não foi possível carregar o perfil
        </h2>

        <p>
          {error || "Profissional não encontrado."}
        </p>

        <a href="/client/providers">
          ← Voltar aos profissionais
        </a>
      </div>
    </div>
  </ClientLayout>
);


}

const providerInitials = getProviderInitials(
provider.name
);

return (
<ClientLayout
activePage="providers"
title="Perfil do profissional"
subtitle="Conheça o profissional, veja os serviços e entre em contacto."
action={ <a
       href="/client/providers"
       className="provider-profile-header-action"
     >
← Voltar aos profissionais </a>
}
> <div className="provider-profile-content">


    {/* =========================
        HERO DO PROFISSIONAL
    ========================= */}

    <section className="provider-profile-hero">

      <div className="provider-hero-decoration provider-hero-decoration-one"></div>

      <div className="provider-hero-decoration provider-hero-decoration-two"></div>

      <div className="provider-hero-watermark">
        {providerInitials}
      </div>

      <div className="provider-hero-top">

        <a
          href="/client/providers"
          className="provider-profile-back"
        >
          ← Voltar aos profissionais
        </a>

        <div className="provider-profile-status">
          <span className="status-dot"></span>
          Perfil profissional
        </div>

      </div>

      <div className="provider-hero-main">

        <div className="provider-hero-avatar-wrapper">

          <div className="provider-hero-avatar">
            {providerInitials}
          </div>

          {provider.is_verified && (
            <div
              className="provider-avatar-verified"
              title="Profissional verificado"
            >
              ✓
            </div>
          )}

        </div>

        <div className="provider-hero-info">

          <div className="provider-hero-label">
            PROFISSIONAL
          </div>

          <h1>
            {provider.name}
          </h1>

          <h2>
            {provider.profession}
          </h2>

          <div className="provider-hero-meta">

            <span>
              📍 {provider.location || "Localização não informada"}
            </span>

            {provider.is_verified && (
              <span className="hero-verified">
                ✓ Verificado
              </span>
            )}

          </div>

        </div>

        <div className="provider-hero-actions">

          <button
            type="button"
            className={`favorite-profile-button ${
              isFavorited ? "favorited" : ""
            }`}
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
          >
            <span className="favorite-profile-heart">
              {favoriteLoading
                ? "..."
                : isFavorited
                  ? "♥"
                  : "♡"}
            </span>

            <span>
              {favoriteLoading
                ? "A atualizar..."
                : isFavorited
                  ? "Favoritado"
                  : "Adicionar aos favoritos"}
            </span>
          </button>

        </div>

      </div>

    </section>

    {favoriteError && (
      <div className="favorite-profile-error">
        {favoriteError}
      </div>
    )}

    {/* =========================
        ESTATÍSTICAS
    ========================= */}

    <section className="provider-profile-stats">

      <div className="profile-stat-card">
        <span className="stat-icon">
          ⭐
        </span>

        <strong>
          {provider.average_rating || "0.0"}
        </strong>

        <span>
          Avaliação média
        </span>
      </div>

      <div className="profile-stat-card">
        <span className="stat-icon">
          💬
        </span>

        <strong>
          {provider.total_reviews || 0}
        </strong>

        <span>
          Avaliações
        </span>
      </div>

      <div className="profile-stat-card">
        <span className="stat-icon">
          🏆
        </span>

        <strong>
          {provider.experience_years || 0}
        </strong>

        <span>
          Anos de experiência
        </span>
      </div>

      <div className="profile-stat-card">
        <span className="stat-icon">
          💰
        </span>

        <strong>
          {provider.hourly_rate
            ? `${provider.hourly_rate} MT`
            : "A combinar"}
        </strong>

        <span>
          Preço por hora
        </span>
      </div>

    </section>

    {/* =========================
        SOBRE
    ========================= */}

    <section className="provider-profile-section">

      <div className="section-heading-premium">

        <div>
          <span>
            PERFIL PROFISSIONAL
          </span>

          <h2>
            Sobre o profissional
          </h2>
        </div>

      </div>

      <p>
        {provider.bio ||
          "Este profissional ainda não adicionou uma descrição."}
      </p>

    </section>

    {/* =========================
        SERVIÇOS
    ========================= */}

    <section className="provider-profile-section">

      <div className="section-header">

        <div>
          <h2>
            🔧 Serviços oferecidos
          </h2>

          <span className="section-description">
            Serviços disponíveis para contratação
          </span>
        </div>

        <span className="section-count">
          {services.length} serviço(s)
        </span>

      </div>

      {services.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            🔧
          </div>

          <p>
            Este profissional ainda não possui
            serviços cadastrados.
          </p>

        </div>

      ) : (

        <div className="services-list">

          {services.map((service) => (

            <div
              className="service-card"
              key={service.id}
            >

              <div className="service-card-content">

                <div className="service-card-icon">
                  🔧
                </div>

                <div>
                  <h3>
                    {service.title}
                  </h3>

                  <p>
                    {service.description}
                  </p>
                </div>

              </div>

              <div className="service-card-actions">

                <div className="service-price">
                  <strong>
                    {service.price} MT
                  </strong>

                  <span>
                    Preço do serviço
                  </span>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setSelectedService(service);
                    setSuccessMessage("");
                    setError("");
                    setChatError("");
                  }}
                >
                  🔵 Solicitar este serviço
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleStartChat}
                  disabled={startingChat}
                >
                  {startingChat
                    ? "Abrindo conversa..."
                    : "💬 Enviar mensagem"}
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>

    {/* =========================
        SUCESSO
    ========================= */}

    {successMessage && (
      <div className="success-message">
        <span>✓</span>
        {successMessage}
      </div>
    )}

    {/* =========================
        SOLICITAR SERVIÇO
    ========================= */}

    {selectedService && (

      <section className="provider-profile-section request-section">

        <div className="section-header">

          <div>
            <h2>
              📋 Solicitar serviço
            </h2>

            <span className="section-description">
              Envie os detalhes para este profissional.
            </span>
          </div>

          <button
            type="button"
            className="close-section-button"
            onClick={() => setSelectedService(null)}
          >
            ✕ Fechar
          </button>

        </div>

        <div className="request-selected-service">

          <div>
            <span>
              SERVIÇO SELECIONADO
            </span>

            <h3>
              {selectedService.title}
            </h3>

            <p>
              {selectedService.description}
            </p>
          </div>

          <strong>
            {selectedService.price} MT
          </strong>

        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();

            try {
              setSubmitting(true);
              setError("");
              setSuccessMessage("");

              console.log(
                "Enviando solicitação..."
              );

              console.log(
                "Serviço:",
                selectedService
              );

              console.log(
                "Descrição:",
                description
              );

              console.log(
                "Localização:",
                location
              );

              console.log(
                "Data:",
                requestedDate
              );

              const result =
                await createServiceRequest(
                  selectedService.id,
                  description,
                  location,
                  requestedDate || null
                );

              console.log(
                "Resposta da API:",
                result
              );

              console.log(
                "Mensagem:",
                result.message
              );

              console.log(
                "Pedido criado:",
                result.request
              );

              setSuccessMessage(
                result.message ||
                "Solicitação enviada com sucesso!"
              );

              setDescription("");
              setLocation("");
              setRequestedDate("");

              setSelectedService(null);

            } catch (err) {
              setError(
                err.message ||
                "Erro ao enviar solicitação."
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >

          <div className="form-group">

            <label>
              Descreva o serviço que precisa
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Explique detalhadamente o que precisa..."
              minLength={10}
              maxLength={2000}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Localização
            </label>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Ex: Beira, Macurungo"
              minLength={2}
              maxLength={200}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Data pretendida
            </label>

            <input
              type="datetime-local"
              value={requestedDate}
              onChange={(event) =>
                setRequestedDate(event.target.value)
              }
            />

          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {chatError && (
            <div className="error-message">
              {chatError}
            </div>
          )}

          <button
            type="submit"
            className="primary-button request-submit-button"
            disabled={submitting}
          >
            {submitting
              ? "Enviando..."
              : "📨 Enviar solicitação"}
          </button>

        </form>

      </section>

    )}

    {/* =========================
        AVALIAÇÕES
    ========================= */}

    <section className="provider-profile-section">

      <div className="section-header">

        <div>

          <h2>
            ⭐ Avaliações dos clientes
          </h2>

          <span className="section-description">
            Opiniões de clientes que contrataram este profissional
          </span>

        </div>

        <span className="section-count">
          {reviews.length} avaliação(ões)
        </span>

      </div>

      {reviews.length === 0 ? (

        <div className="empty-state">

          <div className="empty-state-icon">
            ⭐
          </div>

          <p>
            Este profissional ainda não possui avaliações.
          </p>

        </div>

      ) : (

        <div className="reviews-list">

          {reviews.map((review) => (

            <div
              className="review-card"
              key={review.id}
            >

              <div className="review-header">

                <div className="review-client">

                  <div className="review-client-avatar">
                    {(review.client_name || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <strong>
                    {review.client_name || "Cliente"}
                  </strong>

                </div>

                <span>
                  {new Date(
                    review.created_at
                  ).toLocaleDateString("pt-PT")}
                </span>

              </div>

              <div className="review-stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>

              {review.comment && (
                <p>
                  "{review.comment}"
                </p>
              )}

            </div>

          ))}

        </div>

      )}

    </section>

  </div>
</ClientLayout>


);
}

export default ClientProviderProfile;
