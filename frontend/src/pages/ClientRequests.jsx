
import { useEffect, useState } from "react";

import { getMyRequests } from "../api/requests";
import { createServiceRequestReview } from "../api/reviews";
import ClientLayout from "../components/ClientLayout";

import "./ClientRequests.css";


function ClientRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // AVALIAÇÃO
  // =====================================================

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");


  // =====================================================
  // CARREGAR PEDIDOS
  // =====================================================

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyRequests();

        setRequests(data);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);

        setError(
          error.message || "Erro ao carregar seus pedidos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);


  // =====================================================
  // ABRIR AVALIAÇÃO
  // =====================================================

  function openReview(request) {
    setSelectedRequest(request);
    setRating(5);
    setComment("");
    setReviewError("");
    setReviewSuccess("");
  }


  // =====================================================
  // FECHAR AVALIAÇÃO
  // =====================================================

  function closeReview() {
    if (reviewLoading) {
      return;
    }

    setSelectedRequest(null);
    setReviewError("");
    setReviewSuccess("");
  }


  // =====================================================
  // ENVIAR AVALIAÇÃO
  // =====================================================

  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!selectedRequest) {
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError("");
      setReviewSuccess("");

      await createServiceRequestReview(
        selectedRequest.id,
        rating,
        comment
      );

      setReviewSuccess(
        "Avaliação enviada com sucesso! ⭐"
      );

      // Marcar pedido como avaliado
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,
                reviewed: true,
              }
            : request
        )
      );

      setTimeout(() => {
        setSelectedRequest(null);
        setReviewSuccess("");
      }, 1500);
    } catch (error) {
      console.error(
        "Erro ao enviar avaliação:",
        error
      );

      setReviewError(
        error.message || "Erro ao enviar avaliação."
      );
    } finally {
      setReviewLoading(false);
    }
  }


  // =====================================================
  // TEXTO DO STATUS
  // =====================================================

  function getStatusLabel(status) {
    const labels = {
      PENDING: "Pendente",
      ACCEPTED: "Aceito",
      IN_PROGRESS: "Em andamento",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
      REJECTED: "Recusado",
    };

    return labels[status] || status;
  }


  // =====================================================
  // ÍCONE DO STATUS
  // =====================================================

  function getStatusIcon(status) {
    const icons = {
      PENDING: "⏳",
      ACCEPTED: "✓",
      IN_PROGRESS: "🔧",
      COMPLETED: "✓",
      CANCELLED: "✕",
      REJECTED: "!",
    };

    return icons[status] || "•";
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ClientLayout
      activePage="requests"
      title="Meus pedidos"
      subtitle="Acompanhe os serviços que você solicitou."
      label="ÁREA DO CLIENTE"
      action={
        <a
          href="/client/providers"
          className="requests-header-button"
        >
          🔎 Procurar profissionais
        </a>
      }
    >
      <div className="client-requests-page">

        {/* =================================================
            HERO
        ================================================= */}

        <div className="requests-hero">

          <div className="requests-hero-decoration decoration-one">
            📋
          </div>

          <div className="requests-hero-decoration decoration-two">
            ✓
          </div>

          <div className="requests-hero-decoration decoration-three">
            ✦
          </div>

          <div className="requests-hero-icon">
            📋
          </div>

          <div className="requests-hero-content">
            <span className="requests-hero-label">
              ÁREA DE PEDIDOS
            </span>

            <h2>
              Meus pedidos
            </h2>

            <p>
              Acompanhe o estado dos serviços que você
              solicitou aos profissionais.
            </p>
          </div>

          <div className="requests-hero-count">
            <strong>
              {requests.length}
            </strong>

            <span>
              {requests.length === 1
                ? "Pedido"
                : "Pedidos"}
            </span>
          </div>

        </div>


        {/* =================================================
            ERRO
        ================================================= */}

        {error && (
          <div className="requests-alert requests-alert-error">
            <span className="requests-alert-icon">
              !
            </span>

            <span>
              {error}
            </span>
          </div>
        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="requests-loading-card">

            <div className="requests-loading-icon">
              📋
            </div>

            <div>
              <h3>
                Carregando seus pedidos...
              </h3>

              <p>
                Estamos buscando os serviços solicitados.
              </p>
            </div>

          </div>

        ) : requests.length === 0 ? (

          /* =================================================
             SEM PEDIDOS
          ================================================= */

          <div className="requests-empty">

            <div className="requests-empty-icon">
              📋
            </div>

            <span className="requests-empty-label">
              AINDA SEM PEDIDOS
            </span>

            <h3>
              Você ainda não fez nenhum pedido
            </h3>

            <p>
              Encontre um profissional e solicite um dos
              serviços disponíveis na MãoNaObra.
            </p>

            <a
              href="/client/providers"
              className="requests-primary-button"
            >
              🔎 Procurar profissionais
            </a>

          </div>

        ) : (

          /* =================================================
             LISTA DE PEDIDOS
          ================================================= */

          <section className="requests-section">

            <div className="requests-section-header">

              <div>
                <span className="requests-section-label">
                  SEUS PEDIDOS
                </span>

                <h2>
                  Serviços solicitados
                </h2>

                <p>
                  {requests.length}{" "}
                  {requests.length === 1
                    ? "pedido encontrado"
                    : "pedidos encontrados"}.
                </p>
              </div>

              <div className="requests-total-badge">
                <span>
                  Total
                </span>

                <strong>
                  {requests.length}
                </strong>
              </div>

            </div>


            <div className="requests-list">

              {requests.map((request) => (
                <article
                  className="premium-request-card"
                  key={request.id}
                >

                  {/* =====================================
                      CABEÇALHO DO CARD
                  ===================================== */}

                  <div className="request-card-top">

                    <div className="request-service-icon">
                      🛠️
                    </div>

                    <div className="request-service-title">

                      <span className="request-number">
                        PEDIDO #{request.id}
                      </span>

                      <h3>
                        {request.service?.title ||
                          "Serviço solicitado"}
                      </h3>

                    </div>

                    <span
                      className={`request-status status-${request.status?.toLowerCase()}`}
                    >
                      <span>
                        {getStatusIcon(request.status)}
                      </span>

                      {getStatusLabel(request.status)}
                    </span>

                  </div>


                  {/* =====================================
                      INFORMAÇÕES
                  ===================================== */}

                  <div className="request-card-body">

                    <div className="request-info-grid">

                      <div className="request-info-item">

                        <span className="request-info-icon">
                          👷
                        </span>

                        <div>
                          <span>
                            PROFISSIONAL
                          </span>

                          <strong>
                            {request.provider?.profession ||
                              "Profissional"}
                          </strong>
                        </div>

                      </div>


                      <div className="request-info-item">

                        <span className="request-info-icon">
                          📍
                        </span>

                        <div>
                          <span>
                            LOCALIZAÇÃO
                          </span>

                          <strong>
                            {request.location ||
                              "Não informado"}
                          </strong>
                        </div>

                      </div>


                      <div className="request-info-item">

                        <span className="request-info-icon">
                          💰
                        </span>

                        <div>
                          <span>
                            VALOR
                          </span>

                          <strong className="request-price">
                            {request.agreed_price} MT
                          </strong>
                        </div>

                      </div>


                      {request.requested_date && (
                        <div className="request-info-item">

                          <span className="request-info-icon">
                            📅
                          </span>

                          <div>
                            <span>
                              DATA SOLICITADA
                            </span>

                            <strong>
                              {new Date(
                                request.requested_date
                              ).toLocaleString("pt-PT")}
                            </strong>
                          </div>

                        </div>
                      )}

                    </div>


                    {request.description && (
                      <div className="request-description">

                        <span className="request-description-icon">
                          📝
                        </span>

                        <div>

                          <span>
                            DESCRIÇÃO DO PEDIDO
                          </span>

                          <p>
                            {request.description}
                          </p>

                        </div>

                      </div>
                    )}

                  </div>


                  {/* =====================================
                      RODAPÉ / AÇÕES
                  ===================================== */}

                  <div className="request-card-footer">

                    <div className="request-footer-info">

                      {request.status === "COMPLETED" ? (

                        request.reviewed ? (

                          <span className="request-reviewed">
                            ✓ Você já avaliou este serviço
                          </span>

                        ) : (

                          <span className="request-review-hint">
                            ⭐ O serviço foi concluído.
                            Compartilhe sua experiência.
                          </span>

                        )

                      ) : (

                        <span className="request-status-hint">
                          {request.status === "IN_PROGRESS"
                            ? "O serviço está em andamento."
                            : "Acompanhe o estado do seu pedido."}
                        </span>

                      )}

                    </div>


                    <div className="request-actions">

                      {request.status === "COMPLETED" &&
                        !request.reviewed && (
                          <button
                            type="button"
                            className="request-review-button"
                            onClick={() =>
                              openReview(request)
                            }
                          >
                            ⭐ Avaliar profissional
                          </button>
                        )}


                      {request.status === "COMPLETED" &&
                        request.reviewed && (
                          <span className="request-reviewed-badge">
                            ✓ Avaliado
                          </span>
                        )}

                    </div>

                  </div>

                </article>
              ))}

            </div>

          </section>
        )}


        {/* =================================================
            MODAL DE AVALIAÇÃO
        ================================================= */}

        {selectedRequest && (
          <div
            className="requests-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !reviewLoading
              ) {
                closeReview();
              }
            }}
          >

            <div className="requests-review-modal">

              <button
                type="button"
                className="requests-modal-close"
                onClick={closeReview}
                disabled={reviewLoading}
                aria-label="Fechar"
              >
                ✕
              </button>


              <div className="requests-modal-header">

                <div className="requests-modal-icon">
                  ⭐
                </div>

                <div>

                  <span>
                    AVALIAÇÃO DO SERVIÇO
                  </span>

                  <h2>
                    Avaliar profissional
                  </h2>

                </div>

              </div>


              <div className="requests-modal-service">

                <span>
                  SERVIÇO
                </span>

                <strong>
                  {selectedRequest.service?.title ||
                    "Serviço solicitado"}
                </strong>

              </div>


              <p className="requests-modal-question">
                Como foi a sua experiência com este serviço?
              </p>


              <div className="requests-rating">

                <div className="requests-stars">

                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= rating
                          ? "request-star active"
                          : "request-star"
                      }
                      onClick={() =>
                        setRating(star)
                      }
                      disabled={reviewLoading}
                      aria-label={`${star} estrelas`}
                    >
                      ★
                    </button>
                  ))}

                </div>


                <div className="requests-rating-value">

                  <strong>
                    {rating}/5
                  </strong>

                  <span>
                    {rating === 5
                      ? "Excelente"
                      : rating === 4
                      ? "Muito bom"
                      : rating === 3
                      ? "Bom"
                      : rating === 2
                      ? "Pode melhorar"
                      : "Insatisfatório"}
                  </span>

                </div>

              </div>


              <div className="requests-comment-field">

                <label htmlFor="request-review-comment">
                  Comentário
                </label>

                <textarea
                  id="request-review-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  placeholder="Escreva um comentário sobre o serviço..."
                  rows={5}
                  maxLength={1000}
                  disabled={reviewLoading}
                />

                <span>
                  {comment.length}/1000
                </span>

              </div>


              {reviewError && (
                <div className="requests-alert requests-alert-error modal-alert">

                  <span className="requests-alert-icon">
                    !
                  </span>

                  <span>
                    {reviewError}
                  </span>

                </div>
              )}


              {reviewSuccess && (
                <div className="requests-alert requests-alert-success modal-alert">

                  <span className="requests-alert-icon">
                    ✓
                  </span>

                  <span>
                    {reviewSuccess}
                  </span>

                </div>
              )}


              <div className="requests-modal-actions">

                <button
                  type="button"
                  onClick={closeReview}
                  disabled={reviewLoading}
                  className="requests-cancel-button"
                >
                  Cancelar
                </button>


                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={reviewLoading}
                  className="requests-submit-button"
                >

                  {reviewLoading ? (
                    <>
                      <span className="requests-spinner" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      ⭐ Enviar avaliação
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </ClientLayout>
  );
}


export default ClientRequests;

