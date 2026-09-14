import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function ClientReviews() {

  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {

  try {

    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `${API_URL}/reviews/my`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const data = await response.json();

      throw new Error(
        data.detail || "Não foi possível carregar os projetos."
      );
    }

    const data = await response.json();

    setProjects(data);

  } catch (error) {

    console.error(error);
    setError(error.message);

  } finally {

    setLoading(false);

  }
  }

 


  function openReview(project) {

    setSelectedProject(project);
    setRating(5);
    setComment("");
    setSuccess("");
    setError("");

  }


  function closeReview() {

    setSelectedProject(null);
    setComment("");
    setRating(5);

  }


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

      const response = await fetch(
        `${API_URL}/reviews/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            project_id: selectedProject.id,
            rating: rating,
            comment: comment
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Não foi possível enviar a avaliação."
        );
      }

      setSuccess("Avaliação enviada com sucesso! ⭐");

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === selectedProject.id
            ? {
                ...project,
                reviewed: true
              }
            : project
        )
      );

      setTimeout(() => {
        closeReview();
      }, 1500);

    } catch (error) {

      console.error(error);
      setError(error.message);

    } finally {

      setSending(false);

    }
  }


  if (loading) {

    return (
      <div className="dashboard">
        <main className="dashboard-content">
          <p>Carregando projetos...</p>
        </main>
      </div>
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

        <a
          href="/"
          className="sidebar-logout"
        >
          Voltar ao início
        </a>

      </aside>


      {/* CONTEÚDO */}

      <main className="dashboard-content">

        <div className="dashboard-header">

          <div>

            <span className="section-label">
              AVALIAÇÕES
            </span>

            <h1>
              Avalie os profissionais
            </h1>

            <p>
              Avalie os serviços que já foram concluídos.
            </p>

          </div>

        </div>


        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {success && (

          <div className="success-message">
            {success}
          </div>

        )}


        {projects.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ⭐
            </div>

            <h3>
              Nenhum projeto encontrado
            </h3>

            <p>
              Quando você concluir um projeto,
              poderá avaliar o profissional.
            </p>

          </div>

        ) : (

          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Seus projetos
                </h2>

                <p>
                  Escolha um projeto concluído
                  para avaliar o profissional.
                </p>

              </div>

            </div>


            <div className="projects-list">

              {projects.map((project) => (

                <div
                  className="project-card"
                  key={project.id}
                >

                  <div>

                    <span className="section-label">
                      PROJETO #{project.id}
                    </span>

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.description}
                    </p>

                    <span>
                      📍 {project.location}
                    </span>

                    {project.provider && (
                      <div className="provider-info">

                        <strong>
                          👤 {project.provider.name}
                        </strong>

                        <span>
                          💼 {project.provider.profession}
                        </span>

                        {project.provider.is_verified && (
                          <span className="verified-provider">
                              ✓ Verificado
                          </span>
                        )}

                      </div>
                    )}

                  </div>


                  <div className="project-actions">

                    <span
                      className={
                        project.status === "COMPLETED"
                          ? "status-completed"
                          : "status-pending"
                      }
                    >
                      {project.status}
                    </span>


                    {project.status === "COMPLETED" && !project.reviewed && (

                      <button
                        className="register-btn"
                        onClick={() => openReview(project)}
                      >
                        ⭐ Avaliar
                      </button>

                    )}


                    {project.reviewed && (

                      <span className="reviewed-label">
                        ✅ Avaliado
                      </span>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}


      </main>


      {/* MODAL DE AVALIAÇÃO */}

      {selectedProject && (

        <div className="modal-overlay">

          <div className="review-modal">

            <button
              className="modal-close"
              onClick={closeReview}
            >
              ✕
            </button>

            <span className="section-label">
              AVALIAR PROFISSIONAL
            </span>

            <h2>
              {selectedProject.provider?.name || "Profissional"}
            </h2>

            {selectedProject.provider?.profession && (
              <p className="provider-profession">
                💼 {selectedProject.provider.profession}
              </p>
            )}

            <p>
              Projeto: <strong>{selectedProject.title}</strong>
            </p>

            <p>
              Como foi o serviço realizado?
            </p>


            {/* ESTRELAS */}

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
                  onClick={() => setRating(star)}
                >
                  ★
                </button>

              ))}

            </div>


            <form onSubmit={submitReview}>

              <label>
                Comentário
              </label>

              <textarea
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="Conte como foi sua experiência..."
                maxLength={1000}
                rows={5}
              />


              <button
                type="submit"
                className="register-btn"
                disabled={sending}
              >
                {sending
                  ? "Enviando..."
                  : "Enviar avaliação"
                }
              </button>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}

export default ClientReviews;