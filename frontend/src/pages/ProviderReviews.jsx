import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import { getMyProviderReviews } from "../api/provider";


function ProviderReviews() {

  const { user, logout } = useAuth();

  const [reviews, setReviews] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


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


  function renderStars(rating) {

    return (
      <>
        {"⭐".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </>
    );

  }


  return (

    <div className="dashboard">


      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          Mão<span>NaObra</span>
        </div>


        <nav>

          <a href="/provider">
            🏠 Visão geral
          </a>

          <a href="/provider/services">
            🔧 Meus serviços
          </a>

          <a href="/provider/services/new">
            ➕ Criar serviço
          </a>

          <a href="/provider/requests">
            📋 Pedidos recebidos
          </a>

          <a href="/provider/reviews">
            ⭐ Avaliações
          </a>

          <a href="/provider/profile">
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


      {/* MAIN */}

      <main className="dashboard-content">


        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <span className="section-label">
              AVALIAÇÕES
            </span>

            <h1>
              Avaliações dos clientes ⭐
            </h1>

            <p>
              Veja o que os clientes dizem
              sobre o seu trabalho.
            </p>

          </div>

        </div>


        {/* ERRO */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* LOADING */}

        {loading ? (

          <div className="empty-state">

            <h3>
              Carregando avaliações...
            </h3>

          </div>

        ) : !reviews ||
          reviews.total_reviews === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ⭐
            </div>

            <h3>
              Ainda não possui avaliações
            </h3>

            <p>
              Quando um cliente avaliar
              o seu trabalho, a avaliação
              aparecerá aqui.
            </p>

          </div>

        ) : (

          <>


            {/* RESUMO */}

            <section className="dashboard-section">

              <div className="reviews-summary">

                <div className="rating-average">

                  <strong>
                    {reviews.average_rating}
                  </strong>

                  <div className="stars">

                    {renderStars(
                      Math.round(
                        reviews.average_rating
                      )
                    )}

                  </div>

                  <span>

                    {reviews.total_reviews}{" "}

                    {reviews.total_reviews === 1
                      ? "avaliação"
                      : "avaliações"}

                  </span>

                </div>

              </div>

            </section>


            {/* LISTA */}

            <section className="dashboard-section">

              <div className="section-header">

                <div>

                  <h2>
                    Todas as avaliações
                  </h2>

                  <p>
                    Feedback recebido dos seus clientes.
                  </p>

                </div>

              </div>


              <div className="reviews-list">

                {reviews.reviews.map((review) => (

                  <div
                    className="review-card"
                    key={review.id}
                  >

                    <div className="review-header">

                      <div>

                        <h3>
                          {review.client?.name}
                        </h3>

                        <div className="stars">

                          {renderStars(
                            review.rating
                          )}

                        </div>

                      </div>

                    </div>


                    {review.comment ? (

                      <p className="review-comment">
                        "{review.comment}"
                      </p>

                    ) : (

                      <p className="review-comment">
                        Cliente não deixou comentário.
                      </p>

                    )}


                    <span className="review-date">

                      {new Date(
                        review.created_at
                      ).toLocaleDateString(
                        "pt-PT"
                      )}

                    </span>

                  </div>

                ))}

              </div>

            </section>

          </>

        )}

      </main>

    </div>

  );

}


export default ProviderReviews;