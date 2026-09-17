import { useEffect, useState } from "react";

import {
getProject,
getProjectProposals,
acceptProposal,
completeProject
} from "../api/projects";

import {
createReview,
getMyReviewProjects
} from "../api/reviews";

import "./ClientProject.css";

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

    const projectData =
      await getProject(projectId);

    const proposalsData =
      await getProjectProposals(projectId);

    const reviewProjects =
      await getMyReviewProjects();


    setProject(projectData);
    setProposals(proposalsData);


    const currentProjectReview =
      reviewProjects.find(
        (item) => item.id === Number(projectId)
      );


    if (currentProjectReview) {

      setReviewed(
        currentProjectReview.reviewed
      );

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
    "Proposta aceita com sucesso! O projeto agora está em andamento."
  );


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

async function handleCompleteProject() {


const confirmed =
  window.confirm(
    "Tem certeza que deseja marcar este projeto como concluído?"
  );


if (!confirmed) {
  return;
}


try {

  setError("");
  setSuccess("");


  await completeProject(project.id);


  setSuccess(
    "Projeto concluído com sucesso!"
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

async function handleCreateReview() {


if (!comment.trim()) {

  setError(
    "Escreva um comentário antes de enviar a avaliação."
  );

  return;

}


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
    "Avaliação enviada com sucesso!"
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

function getStatusLabel(status) {


const labels = {

  OPEN: "Aberto",

  IN_PROGRESS: "Em andamento",

  COMPLETED: "Concluído",

  PENDING: "Pendente",

  ACCEPTED: "Aceita",

  REJECTED: "Rejeitada"

};

return labels[status] || status;


}

function getStatusClass(status) {


return (
  `status-${status
    ?.toLowerCase()
    .replace("_", "-")}`
);


}

if (loading) {


return (

  <div className="client-project-page">

    <div className="client-project-loading">

      <div className="loading-spinner"></div>

      <h3>Carregando projeto...</h3>

      <p>
        Estamos preparando os detalhes do seu projeto.
      </p>

    </div>

  </div>

);


}

if (error && !project) {


return (

  <div className="client-project-page">

    <div className="client-project-error">

      <div className="error-icon">
        !
      </div>

      <h2>
        Não foi possível carregar o projeto
      </h2>

      <p>
        {error}
      </p>

      <a
        href="/client"
        className="project-secondary-btn"
      >
        ← Voltar para o dashboard
      </a>

    </div>

  </div>

);


}

if (!project) {
return null;
}

return (


<div className="client-project-page">

  {/* =========================
      TOP BAR
  ========================== */}

  <header className="project-topbar">

    <div className="project-brand">
      Mão<span>NaObra</span>
    </div>


    <a
      href="/client"
      className="back-project-btn"
    >
      <span>←</span>
      Voltar aos projetos
    </a>

  </header>


  <main className="client-project-container">

    {/* =========================
        PAGE HEADER
    ========================== */}

    <div className="project-page-header">

      <div className="project-page-heading">

        <span className="project-eyebrow">
          MEU PROJETO
        </span>

        <h1>
          {project.title}
        </h1>

        <p>
          Acompanhe os detalhes, propostas e evolução
          do serviço que você publicou.
        </p>

      </div>


      <span
        className={`project-status-badge ${getStatusClass(
          project.status
        )}`}
      >

        <span className="status-dot"></span>

        {getStatusLabel(project.status)}

      </span>

    </div>


    {/* =========================
        ALERTS
    ========================== */}

    {error && (

      <div className="project-alert project-alert-error">

        <span>!</span>

        <div>
          <strong>Ocorreu um problema</strong>
          <p>{error}</p>
        </div>

      </div>

    )}


    {success && (

      <div className="project-alert project-alert-success">

        <span>✓</span>

        <div>
          <strong>Operação realizada</strong>
          <p>{success}</p>
        </div>

      </div>

    )}


    {/* =========================
        PROJECT OVERVIEW
    ========================== */}

    <section className="project-overview-card">

      <div className="overview-main">

        <div className="overview-title-row">

          <div className="overview-icon">
            📋
          </div>

          <div>

            <span>
              DETALHES DO SERVIÇO
            </span>

            <h2>
              Sobre este projeto
            </h2>

          </div>

        </div>


        <div className="project-description">

          <label>
            Descrição
          </label>

          <p>
            {project.description ||
              "Nenhuma descrição foi adicionada."}
          </p>

        </div>


        <div className="project-meta-grid">

          <div className="project-meta-card">

            <span className="meta-icon">
              📂
            </span>

            <div>

              <small>
                Categoria
              </small>

              <strong>
                {project.category || "Não definida"}
              </strong>

            </div>

          </div>


          <div className="project-meta-card">

            <span className="meta-icon">
              📍
            </span>

            <div>

              <small>
                Localização
              </small>

              <strong>
                {project.location || "Não definida"}
              </strong>

            </div>

          </div>


          <div className="project-meta-card project-budget-card">

            <span className="meta-icon">
              💰
            </span>

            <div>

              <small>
                Orçamento
              </small>

              <strong>

                {project.budget !== null &&
                project.budget !== undefined
                  ? `${project.budget} MT`
                  : "Não definido"}

              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* PROJECT ACTION */}

      {project.status === "IN_PROGRESS" && (

        <div className="project-action-panel">

          <div className="action-icon">
            ✓
          </div>

          <div>

            <strong>
              Projeto em andamento
            </strong>

            <p>
              Quando o serviço estiver concluído,
              confirme aqui para finalizar o projeto.
            </p>

          </div>

          <button
            onClick={handleCompleteProject}
            className="complete-project-btn"
          >
            ✓ Marcar como concluído
          </button>

        </div>

      )}

    </section>


    {/* =========================
        PROPOSALS
    ========================== */}

    <section className="project-section">

      <div className="project-section-header">

        <div>

          <span className="project-section-label">
            PROFISSIONAIS
          </span>

          <h2>
            Propostas recebidas
          </h2>

          <p>
            Compare as propostas e escolha o profissional
            que melhor atende às suas necessidades.
          </p>

        </div>


        <div className="proposal-counter">

          <strong>
            {proposals.length}
          </strong>

          <span>
            {proposals.length === 1
              ? "proposta"
              : "propostas"}
          </span>

        </div>

      </div>


      {proposals.length === 0 ? (

        <div className="project-empty-state">

          <div className="empty-project-icon">
            💼
          </div>

          <h3>
            Ainda não recebeu propostas
          </h3>

          <p>
            Quando profissionais demonstrarem interesse
            no seu projeto, as propostas aparecerão aqui.
          </p>

        </div>

      ) : (

        <div className="premium-proposals-grid">

          {proposals.map((proposal) => (

            <article
              className={`premium-proposal-card ${
                proposal.status === "ACCEPTED"
                  ? "proposal-accepted"
                  : ""
              }`}
              key={proposal.id}
            >

              <div className="proposal-top">

                <div className="provider-profile">

                  <div className="provider-avatar">

                    {(
                      proposal.provider?.name ||
                      "P"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>


                  <div>

                    <h3>
                      {proposal.provider?.name ||
                        "Profissional"}
                    </h3>

                    <span>
                      Proposta #{proposal.id}
                    </span>

                  </div>

                </div>


                <span
                  className={`proposal-status ${getStatusClass(
                    proposal.status
                  )}`}
                >
                  {getStatusLabel(
                    proposal.status
                  )}
                </span>

              </div>


              <div className="proposal-price-box">

                <span>
                  Valor proposto
                </span>

                <strong>
                  {proposal.price} MT
                </strong>

              </div>


              <div className="proposal-message-box">

                <span>
                  Mensagem do profissional
                </span>

                <p>
                  "{proposal.message}"
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
                    ? (
                      <>
                        <span className="button-spinner"></span>
                        Aceitando...
                      </>
                    )
                    : (
                      <>
                        ✓ Aceitar proposta
                      </>
                    )}

                </button>

              )}


              {proposal.status === "ACCEPTED" && (

                <div className="proposal-result accepted-result">

                  <span>
                    ✓
                  </span>

                  Esta proposta foi aceita

                </div>

              )}


              {proposal.status === "REJECTED" && (

                <div className="proposal-result rejected-result">

                  <span>
                    —
                  </span>

                  Esta proposta foi rejeitada

                </div>

              )}

            </article>

          ))}

        </div>

      )}

    </section>


    {/* =========================
        REVIEW
    ========================== */}

    {project.status === "COMPLETED" && (

      <section className="review-section">

        {!reviewed ? (

          <>

            <div className="review-header">

              <div className="review-icon">
                ⭐
              </div>

              <div>

                <span>
                  SUA EXPERIÊNCIA
                </span>

                <h2>
                  Avalie o profissional
                </h2>

                <p>
                  A sua avaliação ajuda outros clientes
                  a escolherem profissionais na plataforma.
                </p>

              </div>

            </div>


            <div className="review-form">

              <div className="review-rating">

                <label>
                  Como foi o trabalho?
                </label>

                <div className="rating-options">

                  {[5, 4, 3, 2, 1].map(
                    (value) => (

                      <button
                        key={value}
                        type="button"
                        className={
                          rating === value
                            ? "rating-option active"
                            : "rating-option"
                        }
                        onClick={() =>
                          setRating(value)
                        }
                      >

                        <span>
                          ★
                        </span>

                        <small>
                          {value}
                        </small>

                      </button>

                    )
                  )}

                </div>

                <strong className="rating-label">

                  {rating === 5 && "Excelente"}
                  {rating === 4 && "Muito bom"}
                  {rating === 3 && "Bom"}
                  {rating === 2 && "Razoável"}
                  {rating === 1 && "Ruim"}

                </strong>

              </div>


              <div className="review-comment">

                <label>
                  Comentário
                </label>

                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="Conte como foi a sua experiência com o profissional..."
                />

              </div>


              <button
                onClick={handleCreateReview}
                className="submit-review-btn"
                disabled={reviewLoading}
              >

                {reviewLoading
                  ? (
                    <>
                      <span className="button-spinner"></span>
                      Enviando...
                    </>
                  )
                  : (
                    <>
                      ⭐ Enviar avaliação
                    </>
                  )}

              </button>

            </div>

          </>

        ) : (

          <div className="review-completed">

            <div className="review-completed-icon">
              ✓
            </div>

            <div>

              <h3>
                Avaliação enviada
              </h3>

              <p>
                Obrigado pelo seu feedback!
                A sua avaliação foi registrada com sucesso.
              </p>

            </div>

          </div>

        )}

      </section>

    )}

  </main>

</div>

);

}

export default ClientProject;
