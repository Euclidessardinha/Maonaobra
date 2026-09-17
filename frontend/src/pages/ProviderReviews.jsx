
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  getMyProviderReviews,
  getProviderRequests
} from "../api/provider";

import NotificationBell from "../components/NotificationBell";

import "./ProviderReviews.css";


function ProviderReviews() {

  const { user, logout } = useAuth();

  const [reviews, setReviews] = useState(null);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);


  /* =========================================================
     CARREGAR AVALIAÇÕES
     ========================================================= */

  useEffect(() => {

    async function loadReviews() {

      try {

        setLoading(true);
        setError("");

        const data = await getMyProviderReviews();

        setReviews(data);

      } catch (error) {

        console.error(
          "Erro ao carregar avaliações:",
          error
        );

        setError(
          error.message ||
          "Erro ao carregar avaliações."
        );

      } finally {

        setLoading(false);

      }

    }

    loadReviews();

  }, []);


  /* =========================================================
     CARREGAR PEDIDOS
     Usado apenas para mostrar o contador no navbar
     ========================================================= */

  useEffect(() => {

    async function loadRequests() {

      try {

        const data = await getProviderRequests();

        setRequests(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Erro ao carregar pedidos para o menu:",
          error
        );

        setRequests([]);

      }

    }

    loadRequests();

  }, []);


  /* =========================================================
     ESC PARA FECHAR MENU
     ========================================================= */

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


  /* =========================================================
     BLOQUEAR SCROLL COM MENU ABERTO
     ========================================================= */

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


  /* =========================================================
     MENU
     ========================================================= */

  function closeMenu() {

    setMenuOpen(false);

  }


  function handleLogout() {

    closeMenu();

    logout();

  }


  function handleClientMode() {

    closeMenu();

    window.location.href = "/client";

  }


  /* =========================================================
     UTILITÁRIOS
     ========================================================= */

  function getInitials(name) {

    if (!name) {
      return "P";
    }

    const parts = name
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


  function renderStars(
    rating,
    size = "normal"
  ) {

    const numericRating =
      Math.max(
        0,
        Math.min(
          5,
          Math.round(
            Number(rating) || 0
          )
        )
      );

    return (

      <span
        className={`provider-review-stars ${size}`}
        aria-label={`${numericRating} de 5 estrelas`}
      >

        {[1, 2, 3, 4, 5].map((star) => (

          <span
            key={star}
            className={
              star <= numericRating
                ? "star filled"
                : "star empty"
            }
          >
            ★
          </span>

        ))}

      </span>

    );

  }


  function formatDate(date) {

    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "pt-PT",
      {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );

  }


  function getRatingCount(rating) {

    if (
      !reviews ||
      !Array.isArray(reviews.reviews)
    ) {
      return 0;
    }

    return reviews.reviews.filter(
      (review) =>
        Number(review.rating) === rating
    ).length;

  }


  function getRatingPercentage(rating) {

    if (
      !reviews ||
      !reviews.total_reviews
    ) {
      return 0;
    }

    return Math.round(
      (
        getRatingCount(rating) /
        reviews.total_reviews
      ) * 100
    );

  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <div className="provider-reviews-page">


      {/* =====================================================
          MOBILE HEADER
          ===================================================== */}

      <header className="provider-mobile-header">

        <button
          className="provider-hamburger"
          onClick={() => setMenuOpen(true)}
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
          ===================================================== */}

      {menuOpen && (

        <div
          className="provider-sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />

      )}


      {/* =====================================================
          SIDEBAR
          Igual ao ProviderDashboard
          ===================================================== */}

      <aside
        className={`provider-sidebar ${
          menuOpen
            ? "provider-sidebar-open"
            : ""
        }`}
      >

        {/* BOTÃO FECHAR MOBILE */}

        <button
          className="provider-sidebar-close"
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          ×
        </button>


        {/* BRAND */}

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


        {/* ÁREA DO PRESTADOR */}

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


        {/* NAVIGATION */}

        <nav className="provider-sidebar-nav">


          {/* VISÃO GERAL */}

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


          {/* MEUS SERVIÇOS */}

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


          {/* CRIAR SERVIÇO */}

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


          {/* PEDIDOS */}

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

            {requests.length > 0 && (

              <span className="provider-nav-count">
                {requests.length}
              </span>

            )}

          </a>


          {/* PROJETOS */}

          <a
            href="/provider/projects"
            onClick={closeMenu}
            className="provider-nav-link"
          >

            <span className="provider-nav-icon">
              ◉
            </span>

            <span>
              Projetos disponíveis
            </span>

          </a>


          {/* MENSAGENS */}

          <a
            href="/provider/chat"
            onClick={closeMenu}
            className="provider-nav-link provider-messages-link"
          >

            <span className="provider-nav-icon provider-messages-icon">

              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >

                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />

              </svg>

            </span>

            <span className="provider-messages-label">
              Mensagens
            </span>

            <span className="provider-messages-status">

              <span className="provider-messages-status-dot"></span>

            </span>

          </a>


          {/* AVALIAÇÕES - ATIVO */}

          <a
            href="/provider/reviews"
            onClick={closeMenu}
            className="provider-nav-link active"
          >

            <span className="provider-nav-icon">
              ★
            </span>

            <span>
              Avaliações
            </span>

          </a>


          {/* DIVISOR */}

          <div className="provider-nav-divider"></div>


          <div className="provider-nav-title">
            CONTA
          </div>


          {/* PERFIL */}

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


          {/* PÁGINA INICIAL */}

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


        {/* =================================================
            PARTE INFERIOR DA SIDEBAR
            ================================================= */}

        <div className="provider-sidebar-bottom">


          {/* MODO CLIENTE */}

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


          {/* UTILIZADOR */}

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


          {/* LOGOUT */}

          <button
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
          MAIN
          ===================================================== */}

      <main className="provider-main">


        {/* ===================================================
            CABEÇALHO
            =================================================== */}

        <section className="provider-reviews-hero">

          <div>

            <span className="provider-reviews-eyebrow">
              AVALIAÇÕES
            </span>

            <h1>
              O que os clientes dizem
            </h1>

            <p>
              Acompanhe o feedback recebido e veja
              como os clientes avaliam o seu trabalho.
            </p>

          </div>


          {!loading &&
            reviews &&
            reviews.total_reviews > 0 && (

              <div className="provider-reviews-total-badge">

                <span className="total-badge-icon">
                  ★
                </span>

                <div>

                  <strong>
                    {reviews.total_reviews}
                  </strong>

                  <span>
                    {reviews.total_reviews === 1
                      ? "avaliação recebida"
                      : "avaliações recebidas"}
                  </span>

                </div>

              </div>

            )}

        </section>


        {/* ===================================================
            ERRO
            =================================================== */}

        {error && (

          <div className="provider-reviews-error">

            <span className="error-icon">
              !
            </span>

            <div>

              <strong>
                Não foi possível carregar as avaliações
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>

        )}


        {/* ===================================================
            LOADING
            =================================================== */}

        {loading ? (

          <div className="provider-reviews-loading">

            <div className="loading-spinner"></div>

            <h3>
              A carregar avaliações...
            </h3>

            <p>
              Estamos a preparar o seu feedback.
            </p>

          </div>

        ) : !reviews ||
          reviews.total_reviews === 0 ? (

          /* =================================================
             SEM AVALIAÇÕES
             ================================================= */

          <div className="provider-reviews-empty">

            <div className="empty-review-icon">
              ★
            </div>

            <h2>
              Ainda não possui avaliações
            </h2>

            <p>
              Quando um cliente avaliar o seu trabalho,
              a avaliação aparecerá aqui.
            </p>

            <a
              href="/provider/services"
              className="empty-review-button"
            >
              Ver meus serviços
              <span>→</span>
            </a>

          </div>

        ) : (

          <>


            {/* =================================================
                RESUMO DAS AVALIAÇÕES
                ================================================= */}

            <section className="provider-rating-overview">


              {/* MÉDIA */}

              <div className="provider-rating-main">

                <span className="rating-number">
                  {Number(
                    reviews.average_rating || 0
                  ).toFixed(1)}
                </span>

                {renderStars(
                  reviews.average_rating,
                  "large"
                )}

                <span className="rating-caption">
                  Classificação média
                </span>

                <span className="rating-total">
                  Baseada em {reviews.total_reviews}{" "}
                  {reviews.total_reviews === 1
                    ? "avaliação"
                    : "avaliações"}
                </span>

              </div>


              <div className="rating-divider"></div>


              {/* DISTRIBUIÇÃO */}

              <div className="rating-breakdown">

                {[5, 4, 3, 2, 1].map(
                  (rating) => {

                    const count =
                      getRatingCount(
                        rating
                      );

                    const percentage =
                      getRatingPercentage(
                        rating
                      );

                    return (

                      <div
                        className="rating-row"
                        key={rating}
                      >

                        <span className="rating-row-number">
                          {rating}
                        </span>

                        <span className="rating-row-star">
                          ★
                        </span>

                        <div className="rating-bar">

                          <div
                            className="rating-bar-fill"
                            style={{
                              width:
                                `${percentage}%`
                            }}
                          ></div>

                        </div>

                        <span className="rating-row-count">
                          {count}
                        </span>

                      </div>

                    );

                  }
                )}

              </div>

            </section>


            {/* =================================================
                LISTA DE AVALIAÇÕES
                ================================================= */}

            <section className="provider-reviews-section">


              <div className="provider-reviews-section-header">

                <div>

                  <span className="section-kicker">
                    FEEDBACK DOS CLIENTES
                  </span>

                  <h2>
                    Todas as avaliações
                  </h2>

                  <p>
                    Opiniões deixadas pelos clientes
                    após os serviços realizados.
                  </p>

                </div>


                <div className="reviews-count-pill">

                  {reviews.total_reviews}

                  {" "}

                  {reviews.total_reviews === 1
                    ? "avaliação"
                    : "avaliações"}

                </div>

              </div>


              <div className="provider-reviews-list">

                {Array.isArray(
                  reviews.reviews
                ) &&
                  reviews.reviews.map(
                    (review) => (

                      <article
                        className="provider-review-card"
                        key={review.id}
                      >


                        {/* CLIENTE + NOTA */}

                        <div className="review-card-top">

                          <div className="review-client">

                            <div className="review-client-avatar">
                              {getInitials(
                                review.client?.name
                              )}
                            </div>

                            <div>

                              <h3>
                                {review.client?.name ||
                                  "Cliente"}
                              </h3>

                              <span>
                                Cliente
                              </span>

                            </div>

                          </div>


                          <div className="review-rating">

                            {renderStars(
                              review.rating
                            )}

                            <span className="review-rating-value">
                              {review.rating}/5
                            </span>

                          </div>

                        </div>


                        {/* COMENTÁRIO */}

                        <div className="review-card-content">

                          {review.comment ? (

                            <p>
                              “{review.comment}”
                            </p>

                          ) : (

                            <p className="review-no-comment">
                              O cliente não deixou um
                              comentário, mas avaliou o
                              serviço com estrelas.
                            </p>

                          )}

                        </div>


                        {/* DATA */}

                        <div className="review-card-footer">

                          <span className="review-date-icon">
                            ◷
                          </span>

                          <span>
                            {formatDate(
                              review.created_at
                            )}
                          </span>

                        </div>

                      </article>

                    )
                  )}

              </div>

            </section>

          </>

        )}

      </main>

    </div>

  );

}


export default ProviderReviews;

