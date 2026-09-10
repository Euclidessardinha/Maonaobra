
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getMyRequests } from "../api/requests";
import { createServiceRequestReview } from "../api/reviews";


function ClientRequests() {

  const {
    user,
    logout
  } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Avaliação
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");


  useEffect(() => {

    async function loadRequests() {

      try {

        setLoading(true);
        setError("");

        const data = await getMyRequests();

        setRequests(data);

      } catch (error) {

        console.error(
          "Erro ao carregar pedidos:",
          error
        );

        setError(
          error.message ||
          "Erro ao carregar seus pedidos."
        );

      } finally {

        setLoading(false);

      }

    }

    loadRequests();

  }, []);


  function openReview(request) {

    setSelectedRequest(request);

    setRating(5);
    setComment("");
    setReviewError("");
    setReviewSuccess("");

  }


  function closeReview() {

    if (reviewLoading) {
      return;
    }

    setSelectedRequest(null);
    setReviewError("");
    setReviewSuccess("");

  }


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

      // Remove o pedido da lista de pedidos avaliáveis
      // usando uma propriedade local para marcar como avaliado.
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,
                reviewed: true
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
        error.message ||
        "Erro ao enviar avaliação."
      );

    } finally {

      setReviewLoading(false);

    }

  }


  return (

    <div className="dashboard">

      <aside className="sidebar">

        <div className="logo">
          Mão<span>NaObra</span>
        </div>


        <nav>

          <a href="/client">
            🏠 Visão geral
          </a>

          <a href="/client/requests">
            📋 Meus pedidos
          </a>

          <a href="/client/favorites">
            ❤️ Favoritos
          </a>

          <a href="/client/reviews">
            ⭐ Avaliações
          </a>

          <a href="/client/profile">
            👤 Meu perfil
          </a>

        </nav>


        <button
          onClick={logout}
          className="sidebar-logout"
        >
          Sair
        </button>

      </aside>


      <main className="dashboard-content">

        <div className="dashboard-header">

          <div>

            <span className="section-label">
              ÁREA DO CLIENTE
            </span>

            <h1>
              Meus pedidos
            </h1>

            <p>
              Acompanhe os serviços que você solicitou.
            </p>

          </div>


          <a
            href="/client/providers"
            className="register-btn"
          >
            Procurar profissionais
          </a>

        </div>


        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {loading ? (

          <div className="empty-state">

            <h3>
              Carregando seus pedidos...
            </h3>

          </div>

        ) : requests.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              📋
            </div>

            <h3>
              Você ainda não fez nenhum pedido
            </h3>

            <p>
              Encontre um profissional e solicite
              um dos serviços disponíveis.
            </p>

            <a
              href="/client/providers"
              className="register-btn"
            >
              Procurar profissionais
            </a>

          </div>

        ) : (

          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Serviços solicitados
                </h2>

                <p>
                  {requests.length} pedido(s) encontrado(s).
                </p>

              </div>

            </div>


            <div className="request-list">

              {requests.map((request) => (

                <div
                  className="request-card"
                  key={request.id}
                >

                  <div>

                    <h3>
                      {request.service?.title}
                    </h3>

                    <p>
                      👷 Profissional:{" "}
                      {request.provider?.profession ||
                        "Profissional"}
                    </p>

                    <p>
                      📍 {request.location}
                    </p>

                    <p>
                      💰 {request.agreed_price} MT
                    </p>

                    {request.requested_date && (

                      <p>
                        📅{" "}
                        {new Date(
                          request.requested_date
                        ).toLocaleString("pt-PT")}
                      </p>

                    )}

                    <p>
                      📝 {request.description}
                    </p>

                  </div>


                  <div className="project-card-actions">

                    <span
                      className={
                        `status-badge status-${request.status?.toLowerCase()}`
                      }
                    >
                      {request.status}
                    </span>


                    {request.status === "COMPLETED" && !request.reviewed && (

                      <button
                        type="button"
                        className="register-btn"
                        onClick={() => openReview(request)}
                        style={{
                          marginTop: "10px"
                        }}
                      >
                        ⭐ Avaliar profissional
                      </button>

                    )}


                    {request.status === "COMPLETED" && request.reviewed && (

                      <span
                        style={{
                          display: "block",
                          marginTop: "10px",
                          fontSize: "14px",
                          color: "#16a34a",
                          fontWeight: "600"
                        }}
                      >
                        ✓ Avaliado
                      </span>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* =====================================================
            MODAL DE AVALIAÇÃO
        ====================================================== */}

        {selectedRequest && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
          >

            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "30px",
                width: "100%",
                maxWidth: "500px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}
            >

              <h2>
                Avaliar profissional
              </h2>

              <p>
                Como foi o serviço de{" "}
                <strong>
                  {selectedRequest.service?.title}
                </strong>?
              </p>


              {/* ESTRELAS */}

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  margin: "20px 0",
                  fontSize: "32px"
                }}
              >

                {[1, 2, 3, 4, 5].map((star) => (

                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    disabled={reviewLoading}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: reviewLoading
                        ? "not-allowed"
                        : "pointer",
                      fontSize: "32px",
                      opacity: star <= rating ? 1 : 0.3
                    }}
                  >
                    ★
                  </button>

                ))}

              </div>


              <p>
                Nota: <strong>{rating}/5</strong>
              </p>


              {/* COMENTÁRIO */}

              <textarea
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="Escreva um comentário sobre o serviço..."
                rows={5}
                disabled={reviewLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  resize: "vertical",
                  marginTop: "10px",
                  boxSizing: "border-box"
                }}
              />


              {reviewError && (

                <div
                  className="error-message"
                  style={{
                    marginTop: "15px"
                  }}
                >
                  {reviewError}
                </div>

              )}


              {reviewSuccess && (

                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#dcfce7",
                    color: "#166534"
                  }}
                >
                  {reviewSuccess}
                </div>

              )}


              {/* BOTÕES */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  justifyContent: "flex-end"
                }}
              >

                <button
                  type="button"
                  onClick={closeReview}
                  disabled={reviewLoading}
                  className="sidebar-logout"
                >
                  Cancelar
                </button>


                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={reviewLoading}
                  className="register-btn"
                >
                  {reviewLoading
                    ? "Enviando..."
                    : "Enviar avaliação ⭐"}
                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>

  );

}


export default ClientRequests;

