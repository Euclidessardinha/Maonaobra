import { useEffect, useState } from "react";

import {
  getProject,
  getProjectProposals,
  acceptProposal,
  completeProject
} from "../api/projects";

import { createReview, getMyReviewProjects } from "../api/reviews";


function ClientProject() {

  const [project, setProject] = useState(null);

  const [proposals, setProposals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [accepting, setAccepting] = useState(null);

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewed, setReviewed] = useState(false);

  const [success, setSuccess] = useState("");


  useEffect(() => {

    async function loadProject() {

      try {

        setLoading(true);
        setError("");

        const pathParts =
          window.location.pathname.split("/");

        const projectId =
          pathParts[pathParts.length - 1];


        const [
          projectData,
          proposalsData,
          reviewProjects
        ] = await Promise.all([

          getProject(projectId),

          getProjectProposals(projectId),

          getMyReviewProjects()

        ]);


        setProject(projectData);

        setProposals(proposalsData);

        const currentProjectReview = reviewProjects.find(
          (item) => item.id === Number(projectId)
        );

        if (currentProjectReview) {
          setReviewed(currentProjectReview.reviewed);
        }

      } catch (error) {

        console.error(
          "Erro ao carregar projeto:",
          error
        );

        setError(
          error.message ||
          "Erro ao carregar projeto."
        );

      } finally {

        setLoading(false);

      }

    }

    loadProject();

  }, []);


  async function handleAcceptProposal(proposalId) {

    const confirmed =
      window.confirm(
        "Tem certeza que deseja aceitar esta proposta? As outras propostas serão rejeitadas."
      );


    if (!confirmed) {
      return;
    }


    try {

      setAccepting(proposalId);

      setError("");

      setSuccess("");


      await acceptProposal(proposalId);


      setSuccess(
        "Proposta aceita com sucesso! 🎉 O projeto agora está em andamento."
      );


      // Atualizar o projeto e as propostas

      const pathParts =
        window.location.pathname.split("/");

      const projectId =
        pathParts[pathParts.length - 1];


      const [
        updatedProject,
        updatedProposals
      ] = await Promise.all([

        getProject(projectId),

        getProjectProposals(projectId)

      ]);


      setProject(updatedProject);

      setProposals(updatedProposals);

    } catch (error) {

      console.error(
        "Erro ao aceitar proposta:",
        error
      );

      setError(
        error.message ||
        "Erro ao aceitar proposta."
      );

    } finally {

      setAccepting(null);

    }

  }


  async function handleCreateReview() {

    try {

      setError("");
      setSuccess("");
      setReviewLoading(true);

      await createReview(
        project.id,
        Number(rating),
        comment
      );

      setReviewed(true);

      setSuccess(
        "Avaliação enviada com sucesso! ⭐"
      );

      setRating(5);
      setComment("");

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Erro ao enviar avaliação."
      );

    } finally {

      setReviewLoading(false);

    }
  }

  
  async function handleCompleteProject() {

    const confirmed = window.confirm(
      "Tem certeza que deseja marcar este projeto como concluído?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");

      await completeProject(project.id);

      setSuccess(
        "Projeto concluído com sucesso! 🎉"
      );

      const updatedProject =
        await getProject(project.id);

      setProject(updatedProject);

    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Erro ao concluir projeto."
      );

    }
  }




  function getStatusLabel(status) {

    const labels = {
      PENDING: "Pendente",
      ACCEPTED: "Aceita",
      REJECTED: "Rejeitada"
    };

    return labels[status] || status;

  }


  if (loading) {

    return (

      <div className="dashboard">

        <main className="dashboard-content">

          <div className="empty-state">

            <h3>
              Carregando projeto...
            </h3>

          </div>

        </main>

      </div>

    );

  }


  if (error && !project) {

    return (

      <div className="dashboard">

        <main className="dashboard-content">

          <div className="error-message">
            {error}
          </div>

          <a
            href="/client"
            className="register-btn"
          >
            ← Voltar
          </a>

        </main>

      </div>

    );

  }


  if (!project) {
    return null;
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

      </aside>


      {/* CONTEÚDO */}

      <main className="dashboard-content">

        {/* CABEÇALHO */}

        <div className="dashboard-header">

          <div>

            <span className="section-label">
              MEU PROJETO
            </span>

            <h1>
              {project.title}
            </h1>

            <p>
              Consulte os detalhes e as propostas
              recebidas dos profissionais.
            </p>

          </div>


          <a
            href="/client"
            className="register-btn"
          >
            ← Voltar
          </a>

        </div>


        {/* ERRO */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* SUCESSO */}

        {success && (

          <div className="success-message">
            {success}
          </div>

        )}


        {/* DETALHES DO PROJETO */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Detalhes do projeto
              </h2>

              <p>
                Informações do serviço que você publicou.
              </p>

            </div>


            <span
              className={
                `status-badge status-${project.status?.toLowerCase()}`
              }
            >
              {project.status}
            </span>

            
            {project.status === "IN_PROGRESS" && (

              <button
                onClick={handleCompleteProject}
                className="register-btn"
                style={{
                  marginTop: "15px"
                }}
              >
                ✓ Concluir projeto
              </button>

            )}

            
            {project.status === "COMPLETED" && !reviewed && (

              <section className="dashboard-section">

                <div className="section-header">

                  <div>

                    <h2>
                      ⭐ Avaliar profissional
                    </h2>

                    <p>
                      Conte como foi a sua experiência com o profissional.
                    </p>

                  </div>

                </div>


                <div className="proposal-form">

                  <div className="form-group">

                    <label>
                      Avaliação
                    </label>

                    <select
                      value={rating}
                      onChange={(e) =>
                        setRating(Number(e.target.value))
                      }
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
                      <option value={4}>⭐⭐⭐⭐ Muito bom</option>
                      <option value={3}>⭐⭐⭐ Bom</option>
                      <option value={2}>⭐⭐ Razoável</option>
                      <option value={1}>⭐ Ruim</option>
                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Comentário
                    </label>

                    <textarea
                      value={comment}
                      onChange={(e) =>
                        setComment(e.target.value)
                      }
                        placeholder="Escreva um comentário sobre o profissional..."
                    />

                  </div>


                  <button
                    onClick={handleCreateReview}
                    className="register-btn"
                    disabled={reviewLoading}
                  >
                    {reviewLoading
                      ? "Enviando..."
                      : "⭐ Enviar avaliação"}
                  </button>

                </div>

                

              </section>

              )}

              {project.status === "COMPLETED" && reviewed && (

                <div className="success-message">
                  ⭐ Você já avaliou este profissional. Obrigado pelo seu feedback!
                </div>  
              )}

            


          </div>


          <div className="project-details">

            <div className="project-detail-item project-description">

              <span>
                📝 Descrição do projeto
              </span>

              <p>
                {project.description}
              </p>

            </div>


            <div className="project-info-grid">

              <div className="project-detail-item">

                <span>
                  📂 Categoria
                </span>

                <strong>
                  {project.category}
                </strong>

              </div>


              <div className="project-detail-item">

                <span>
                  📍 Localização
                </span>

                <strong>
                  {project.location}
                </strong>

              </div>


              <div className="project-detail-item budget-item">

                <span>
                  💰 Orçamento
                </span>

                <strong>

                  {project.budget !== null &&
                  project.budget !== undefined
                    ? `${project.budget} MT`
                    : "Não definido"}

                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* PROPOSTAS */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Propostas recebidas
              </h2>

              <p>
                Compare as propostas dos profissionais
                interessados no seu projeto.
              </p>

            </div>


            <strong>
              {proposals.length}{" "}
              {proposals.length === 1
                ? "proposta"
                : "propostas"}
            </strong>

          </div>


          {proposals.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                💼
              </div>

              <h3>
                Nenhuma proposta recebida
              </h3>

              <p>
                Quando os profissionais enviarem
                propostas, elas aparecerão aqui.
              </p>

            </div>

          ) : (

            <div className="proposals-list">

              {proposals.map((proposal) => (

                <div
                  className="proposal-card"
                  key={proposal.id}
                >

                  <div className="proposal-card-header">

                    <div>

                      <h3>
                        {proposal.provider?.name ||
                        "Profissional"}
                      </h3>

                      <span>
                        Proposta #{proposal.id}
                      </span>

                    </div>


                    <span
                      className={
                        `status-badge status-${proposal.status?.toLowerCase()}`
                      }
                    >
                      {getStatusLabel(
                        proposal.status
                      )}
                    </span>

                  </div>


                  <div className="proposal-price">

                    <span>
                      Valor proposto
                    </span>

                    <strong>
                      {proposal.price} MT
                    </strong>

                  </div>


                  <div className="proposal-message">

                    <span>
                      💬 Mensagem do profissional
                    </span>

                    <p>
                      {proposal.message}
                    </p>

                  </div>


                  {proposal.status === "PENDING" &&
                  project.status === "OPEN" && (

                    <button
                      className="accept-proposal-btn"
                      onClick={() =>
                        handleAcceptProposal(
                          proposal.id
                        )
                      }
                      disabled={
                        accepting === proposal.id
                      }
                    >

                      {accepting === proposal.id
                        ? "Aceitando..."
                        : "✓ Aceitar proposta"}

                    </button>

                  )}


                  {proposal.status === "ACCEPTED" && (

                    <div className="accepted-message">

                      ✓ Esta proposta foi aceita

                    </div>

                  )}


                  {proposal.status === "REJECTED" && (

                    <div className="rejected-message">

                      Esta proposta foi rejeitada

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>

  );

}


export default ClientProject;