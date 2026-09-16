
import { useEffect, useState } from "react";

import ClientLayout from "../components/ClientLayout";

import "./ClientReviews.css";

const API_URL = import.meta.env.VITE_API_URL;

function ClientReviews() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  /* =========================================================
     CARREGAR PROJETOS
  ========================================================= */

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/reviews/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail ||
            "Não foi possível carregar os projetos."
        );
      }

      const data = await response.json();

      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);

      setError(
        error.message ||
          "Não foi possível carregar os projetos."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     ABRIR MODAL
  ========================================================= */

  function openReview(project) {
    setSelectedProject(project);
    setRating(5);
    setComment("");
    setSuccess("");
    setError("");
  }

  /* =========================================================
     FECHAR MODAL
  ========================================================= */

  function closeReview() {
    if (sending) {
      return;
    }

    setSelectedProject(null);
    setComment("");
    setRating(5);
    setSuccess("");
  }

  /* =========================================================
     ENVIAR AVALIAÇÃO
  ========================================================= */

  async function submitReview(event) {
    event.preventDefault();

    if (!selectedProject) {
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/reviews/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          project_id: selectedProject.id,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível enviar a avaliação."
        );
      }

      setSuccess(
        "Avaliação enviada com sucesso! ⭐"
      );

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === selectedProject.id
            ? {
                ...project,
                reviewed: true,
              }
            : project
        )
      );

      setTimeout(() => {
        setSelectedProject(null);
        setSuccess("");
      }, 1500);
    } catch (error) {
      console.error(
        "Erro ao enviar avaliação:",
        error
      );

      setError(
        error.message ||
          "Não foi possível enviar a avaliação."
      );
    } finally {
      setSending(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <ClientLayout
        activePage="reviews"
        title="Avaliações"
        subtitle="Avalie os serviços que já foram concluídos."
        label="ÁREA DO CLIENTE"
      >
        <div className="client-reviews-page">
          <div className="reviews-loading-card">
            <div className="reviews-loading-icon">
              ⭐
            </div>

            <h3>
              Carregando suas avaliações...
            </h3>

            <p>
              Estamos buscando os seus projetos.
            </p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  /* =========================================================
     PÁGINA
  ========================================================= */

  return (
    <ClientLayout
      activePage="reviews"
      title="Avaliações"
      subtitle="Avalie os serviços que já foram concluídos."
      label="ÁREA DO CLIENTE"
    >
      <div className="client-reviews-page">

        {/* ===================================================
            RESUMO / HERO DE AVALIAÇÕES
        =================================================== */}

        <div className="reviews-intro-card">

          <span className="reviews-background-icon icon-one">
            ⭐
          </span>

          <span className="reviews-background-icon icon-two">
            💬
          </span>

          <span className="reviews-background-icon icon-three">
            ✨
          </span>

          <div className="reviews-intro-icon">
            ⭐
          </div>

          <div className="reviews-intro-content">
            <h2>
              Avaliações
            </h2>

            <p>
              Avalie os profissionais que realizaram
              os seus projetos e compartilhe a sua
              experiência com outros clientes.
            </p>
          </div>

          <div className="reviews-count">
            <strong>
              {projects.length}
            </strong>

            <span>
              {projects.length === 1
                ? "Projeto"
                : "Projetos"}
            </span>
          </div>

        </div>

        {/* ===================================================
            ERRO
        =================================================== */}

        {error && (
          <div className="reviews-alert reviews-alert-error">

            <span className="reviews-alert-icon">
              !
            </span>

            <span>
              {error}
            </span>

          </div>
        )}

        {/* ===================================================
            SUCESSO
        =================================================== */}

        {success && (
          <div className="reviews-alert reviews-alert-success">

            <span className="reviews-alert-icon">
              ✓
            </span>

            <span>
              {success}
            </span>

          </div>
        )}

        {/* ===================================================
            NENHUM PROJETO
        =================================================== */}

        {projects.length === 0 ? (
          <div className="reviews-empty">

            <div className="reviews-empty-icon">
              ⭐
            </div>

            <h3>
              Nenhum projeto encontrado
            </h3>

            <p>
              Quando você concluir um projeto,
              poderá avaliar o profissional.
            </p>

            <a
              href="/client/providers"
              className="reviews-empty-button"
            >
              🔎 Procurar profissionais
            </a>

          </div>
        ) : (

          /* =================================================
             PROJETOS
          ================================================= */

          <section className="reviews-section">

            <div className="reviews-section-header">

              <div>

                <span className="reviews-section-label">
                  SEUS PROJETOS
                </span>

                <h2>
                  Projetos e avaliações
                </h2>

                <p>
                  Escolha um projeto concluído
                  para avaliar o profissional.
                </p>

              </div>

            </div>

            <div className="reviews-list">

              {projects.map((project) => (
                <article
                  className="review-project-card"
                  key={project.id}
                >

                  {/* =======================================
                      CONTEÚDO
                  ======================================= */}

                  <div className="review-project-info">

                    <span className="review-project-label">
                      PROJETO #{project.id}
                    </span>

                    <h3>
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="review-project-description">
                        {project.description}
                      </p>
                    )}

                    {project.location && (
                      <span className="review-location">
                        📍 {project.location}
                      </span>
                    )}

                    {/* PROFISSIONAL */}

                    {project.provider && (
                      <div className="review-provider">

                        <div className="review-provider-avatar">
                          👤
                        </div>

                        <div className="review-provider-info">

                          <strong>
                            {project.provider.name}
                          </strong>

                          {project.provider.profession && (
                            <span>
                              💼 {project.provider.profession}
                            </span>
                          )}

                          {project.provider.is_verified && (
                            <span className="verified-provider">
                              ✓ Profissional verificado
                            </span>
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                  {/* =======================================
                      AÇÕES
                  ======================================= */}

                  <div className="review-project-actions">

                    <span
                      className={
                        project.status === "COMPLETED"
                          ? "status-completed"
                          : "status-pending"
                      }
                    >
                      {project.status === "COMPLETED"
                        ? "CONCLUÍDO"
                        : project.status}
                    </span>

                    {project.status === "COMPLETED" &&
                      !project.reviewed && (
                        <button
                          type="button"
                          className="review-button"
                          onClick={() =>
                            openReview(project)
                          }
                        >
                          ⭐ Avaliar
                        </button>
                      )}

                    {project.reviewed && (
                      <span className="reviewed-label">
                        ✓ Avaliação enviada
                      </span>
                    )}

                  </div>

                </article>
              ))}

            </div>

          </section>
        )}

        {/* ===================================================
            MODAL
        =================================================== */}

        {selectedProject && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !sending
              ) {
                closeReview();
              }
            }}
          >

            <div className="review-modal">

              {/* BOTÃO FECHAR */}

              <button
                type="button"
                className="modal-close"
                onClick={closeReview}
                disabled={sending}
                aria-label="Fechar"
              >
                ✕
              </button>

              {/* CABEÇALHO */}

              <div className="review-modal-header">

                <div className="review-modal-icon">
                  ⭐
                </div>

                <div>

                  <span className="review-modal-label">
                    AVALIAR PROFISSIONAL
                  </span>

                  <h2>
                    {selectedProject.provider?.name ||
                      "Profissional"}
                  </h2>

                </div>

              </div>

              {selectedProject.provider?.profession && (
                <p className="provider-profession">
                  💼 {selectedProject.provider.profession}
                </p>
              )}

              <div className="review-modal-project">

                <span>
                  PROJETO
                </span>

                <strong>
                  {selectedProject.title}
                </strong>

              </div>

              <p className="review-question">
                Como foi o serviço realizado?
              </p>

              {/* ESTRELAS */}

              <div className="rating-container">

                <div className="rating-stars">

                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= rating
                          ? "star active"
                          : "star"
                      }
                      onClick={() =>
                        setRating(star)
                      }
                      disabled={sending}
                      aria-label={`${star} estrelas`}
                    >
                      ★
                    </button>
                  ))}

                </div>

                <span className="rating-hint">
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

              {/* FORMULÁRIO */}

              <form
                onSubmit={submitReview}
                className="review-form"
              >

                <label htmlFor="review-comment">
                  Comentário
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  placeholder="Conte como foi sua experiência com este profissional..."
                  maxLength={1000}
                  rows={5}
                  disabled={sending}
                />

                <div className="review-character-count">
                  {comment.length}/1000
                </div>

                {success && (
                  <div className="reviews-alert reviews-alert-success">

                    <span className="reviews-alert-icon">
                      ✓
                    </span>

                    <span>
                      {success}
                    </span>

                  </div>
                )}

                {error && (
                  <div className="reviews-alert reviews-alert-error">

                    <span className="reviews-alert-icon">
                      !
                    </span>

                    <span>
                      {error}
                    </span>

                  </div>
                )}

                <button
                  type="submit"
                  className="review-submit-button"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="review-spinner" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      ⭐ Enviar avaliação
                    </>
                  )}
                </button>

              </form>

            </div>

          </div>
        )}

      </div>
    </ClientLayout>
  );
}

export default ClientReviews;
