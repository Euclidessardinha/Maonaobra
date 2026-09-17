import { useEffect, useState } from "react";

import { getOpenProjects } from "../api/provider";
import "./ProviderProjects.css";

function ProviderProjects() {

const [projects, setProjects] = useState([]);

const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

useEffect(() => {


async function loadProjects() {

  try {

    setLoading(true);
    setError("");

    const data = await getOpenProjects();

    setProjects(
      Array.isArray(data)
        ? data
        : []
    );

  } catch (error) {

    console.error(
      "Erro ao carregar projetos disponíveis:",
      error
    );

    setError(
      error.message ||
      "Erro ao carregar projetos disponíveis."
    );

  } finally {

    setLoading(false);

  }

}

loadProjects();


}, []);

function handleViewProject(projectId) {


window.location.href =
  `/provider/projects/${projectId}`;


}

function formatBudget(budget) {


if (
  budget === null ||
  budget === undefined ||
  budget === ""
) {
  return "Não definido";
}

return `${Number(budget).toLocaleString("pt-MZ")} MT`;


}

function formatDate(date) {


if (!date) {
  return "";
}

const projectDate = new Date(date);

if (Number.isNaN(projectDate.getTime())) {
  return "";
}

return projectDate.toLocaleDateString(
  "pt-MZ",
  {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }
);


}

return (


<div className="provider-projects-page">

  {/* =====================================================
      SIDEBAR
  ====================================================== */}

  <aside className="provider-projects-sidebar">

    <div className="provider-projects-logo">
      Mão<span>NaObra</span>
    </div>


    <nav className="provider-projects-nav">

      <a href="/provider">
        🏠
        <span>Visão geral</span>
      </a>


      <a href="/provider/services">
        🔧
        <span>Meus serviços</span>
      </a>


      <a href="/provider/services/new">
        ➕
        <span>Criar serviço</span>
      </a>


      <a
        href="/provider/projects"
        className="active"
      >
        📁
        <span>Projetos disponíveis</span>
      </a>


      <a href="/provider/requests">
        📋
        <span>Pedidos recebidos</span>
      </a>


      <a href="/provider/profile">
        👤
        <span>Meu perfil</span>
      </a>

    </nav>


    <div className="provider-projects-sidebar-bottom">

      <a href="/">
        ← Voltar para página inicial
      </a>

    </div>

  </aside>


  {/* =====================================================
      CONTEÚDO
  ====================================================== */}

  <main className="provider-projects-content">

    {/* CABEÇALHO */}

    <header className="provider-projects-header">

      <div>

        <span className="provider-projects-label">
          OPORTUNIDADES
        </span>

        <h1>
          Projetos disponíveis
        </h1>

        <p>
          Encontre projetos publicados por clientes
          e envie propostas para novas oportunidades.
        </p>

      </div>


      <a
        href="/provider"
        className="provider-projects-back-btn"
      >
        ← Voltar
      </a>

    </header>


    {/* ERRO */}

    {error && (

      <div className="provider-projects-error">

        <div className="provider-projects-error-icon">
          !
        </div>

        <div>

          <strong>
            Não foi possível carregar os projetos
          </strong>

          <p>
            {error}
          </p>

        </div>

      </div>

    )}


    {/* CARREGANDO */}

    {loading && (

      <div className="provider-projects-loading">

        <div className="provider-projects-spinner"></div>

        <h3>
          Procurando projetos...
        </h3>

        <p>
          Aguarde enquanto buscamos novas
          oportunidades para você.
        </p>

      </div>

    )}


    {/* LISTA VAZIA */}

    {!loading &&
      !error &&
      projects.length === 0 && (

        <div className="provider-projects-empty">

          <div className="provider-projects-empty-icon">
            📁
          </div>

          <h2>
            Nenhum projeto disponível
          </h2>

          <p>
            Neste momento não existem projetos
            abertos para receber propostas.
          </p>

          <a
            href="/provider"
            className="provider-projects-empty-btn"
          >
            Voltar ao dashboard
          </a>

        </div>

      )}


    {/* PROJETOS */}

    {!loading &&
      projects.length > 0 && (

        <section className="provider-projects-section">

          <div className="provider-projects-section-header">

            <div>

              <h2>
                Oportunidades abertas
              </h2>

              <p>
                {projects.length === 1
                  ? "1 projeto disponível"
                  : `${projects.length} projetos disponíveis`}
              </p>

            </div>

          </div>


          <div className="provider-projects-grid">

            {projects.map((project) => (

              <article
                key={project.id}
                className="provider-project-card"
              >

                {/* CARD HEADER */}

                <div className="provider-project-card-top">

                  <span className="provider-project-category">
                    📂
                    {project.category ||
                      "Sem categoria"}
                  </span>

                  <span className="provider-project-status">
                    ABERTO
                  </span>

                </div>


                {/* TÍTULO */}

                <h3>
                  {project.title}
                </h3>


                {/* DESCRIÇÃO */}

                <p className="provider-project-description">

                  {project.description &&
                  project.description.length > 150
                    ? `${project.description.substring(
                        0,
                        150
                      )}...`
                    : project.description}

                </p>


                {/* INFORMAÇÕES */}

                <div className="provider-project-info">

                  <div className="provider-project-info-item">

                    <span>
                      📍 Localização
                    </span>

                    <strong>
                      {project.location ||
                        "Não informado"}
                    </strong>

                  </div>


                  <div className="provider-project-info-item">

                    <span>
                      💰 Orçamento
                    </span>

                    <strong className="provider-project-budget">
                      {formatBudget(
                        project.budget
                      )}
                    </strong>

                  </div>

                </div>


                {/* RODAPÉ */}

                <div className="provider-project-card-footer">

                  <div className="provider-project-date">

                    {project.created_at
                      ? `Publicado em ${formatDate(
                          project.created_at
                        )}`
                      : "Projeto publicado"}

                  </div>


                  <button
                    type="button"
                    className="provider-project-view-btn"
                    onClick={() =>
                      handleViewProject(
                        project.id
                      )
                    }
                  >
                    Ver projeto
                    <span>→</span>
                  </button>

                </div>

              </article>

            ))}

          </div>

        </section>

      )}

  </main>

</div>


);

}

export default ProviderProjects;
