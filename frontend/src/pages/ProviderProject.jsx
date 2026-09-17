import { useEffect, useState } from "react";
import { getProject, createProposal } from "../api/provider";

import "./ProviderProject.css";


function ProviderProject() {

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [price, setPrice] = useState("");

  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [success, setSuccess] = useState("");


  /* =========================================================
     CARREGAR PROJETO
  ========================================================= */

  useEffect(() => {

    async function loadProject() {

      try {

        setLoading(true);
        setError("");

        const pathParts =
          window.location.pathname.split("/");

        const projectId =
          pathParts[pathParts.length - 1];

        const data =
          await getProject(projectId);

        setProject(data);

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


  /* =========================================================
     ENVIAR PROPOSTA
  ========================================================= */

  async function handleSubmitProposal(event) {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!price || Number(price) <= 0) {

      setError(
        "Informe um valor válido para a proposta."
      );

      return;
    }


    if (!message.trim()) {

      setError(
        "Escreva uma mensagem para o cliente."
      );

      return;
    }


    try {

      setSending(true);

      await createProposal(
        project.id,
        Number(price),
        message
      );


      setSuccess(
        "Proposta enviada com sucesso! 🎉"
      );

      setPrice("");
      setMessage("");

    } catch (error) {

      console.error(
        "Erro ao enviar proposta:",
        error
      );

      setError(
        error.message ||
        "Erro ao enviar proposta."
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

      <div className="provider-project-page">

        <div className="provider-project-loading">

          <div className="provider-project-loading-logo">

            <div className="provider-project-loading-ring" />

            <img
              src="/favicon-mao4.png"
              alt="MãoNaObra"
            />

          </div>

          <p>
            Carregando projeto...
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     ERRO SEM PROJETO
  ========================================================= */

  if (error && !project) {

    return (

      <div className="provider-project-page">

        <div className="provider-project-error-page">

          <div className="provider-project-error-icon">
            ⚠️
          </div>

          <h2>
            Não foi possível carregar o projeto
          </h2>

          <p>
            {error}
          </p>

          <a
            href="/provider/projects"
            className="provider-project-back-btn"
          >
            ← Voltar para projetos
          </a>

        </div>

      </div>

    );

  }


  if (!project) {
    return null;
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="provider-project-page">


      {/* =====================================================
          TOPO
      ===================================================== */}

      <header className="provider-project-topbar">

        <div className="provider-project-topbar-inner">


          <a
            href="/provider/projects"
            className="provider-project-back"
          >

            <span>
              ←
            </span>

            <span>
              Voltar para projetos
            </span>

          </a>


          <div className="provider-project-brand">

            <img
              src="/favicon-mao4.png"
              alt="MãoNaObra"
            />

            <div>

              <strong>
                Mão
              </strong>

              <span>
                NaObra
              </span>

            </div>

          </div>


        </div>

      </header>


      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <main className="provider-project-container">


        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="provider-project-breadcrumb">

          <span>
            Projetos
          </span>

          <span>
            /
          </span>

          <strong>
            Detalhes do projeto
          </strong>

        </div>


        {/* ===================================================
            HERO DO PROJETO
        =================================================== */}

        <section className="provider-project-hero">


          <div className="provider-project-hero-main">


            <div className="provider-project-category">

              <span>
                🛠️
              </span>

              <span>
                {project.category || "Serviço"}
              </span>

            </div>


            <h1>
              {project.title ||
                "Projeto sem título"}
            </h1>


            <p className="provider-project-hero-description">

              Confira os detalhes fornecidos pelo cliente
              e envie a sua proposta.

            </p>


            <div className="provider-project-meta">


              <div className="provider-project-meta-item">

                <div className="provider-project-meta-icon">
                  📍
                </div>

                <div>

                  <span>
                    Localização
                  </span>

                  <strong>
                    {project.location ||
                      "Não especificada"}
                  </strong>

                </div>

              </div>


              <div className="provider-project-meta-item">

                <div className="provider-project-meta-icon">
                  📅
                </div>

                <div>

                  <span>
                    Publicado em
                  </span>

                  <strong>

                    {project.created_at
                      ? new Date(
                          project.created_at
                        ).toLocaleDateString(
                          "pt-MZ",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          }
                        )
                      : "Data não disponível"}

                  </strong>

                </div>

              </div>


            </div>

          </div>


          <div className="provider-project-hero-side">


            <span className="provider-project-status">

              <span className="provider-project-status-dot" />

              Aberto

            </span>


            <span className="provider-project-budget-label">
              Orçamento do cliente
            </span>


            <strong className="provider-project-budget">

              {project.budget !== null &&
              project.budget !== undefined
                ? `${Number(
                    project.budget
                  ).toLocaleString(
                    "pt-MZ"
                  )} MT`
                : "Não definido"}

            </strong>


            <span className="provider-project-budget-note">
              Valor de referência do projeto
            </span>


          </div>


        </section>


        {/* ===================================================
            GRID PRINCIPAL
        =================================================== */}

        <div className="provider-project-grid">


          {/* =================================================
              DETALHES
          ================================================= */}

          <section className="provider-project-card">


            <div className="provider-project-card-header">

              <div className="provider-project-card-icon">
                📝
              </div>

              <div>

                <span className="provider-project-card-label">
                  INFORMAÇÕES
                </span>

                <h2>
                  Sobre este projeto
                </h2>

              </div>

            </div>


            <div className="provider-project-description">

              <h3>
                Descrição do projeto
              </h3>

              <p>

                {project.description ||
                  "O cliente não forneceu uma descrição detalhada."}

              </p>

            </div>


            <div className="provider-project-details-grid">


              <div className="provider-project-detail">

                <span className="provider-project-detail-icon">
                  📂
                </span>

                <div>

                  <span>
                    Categoria
                  </span>

                  <strong>
                    {project.category ||
                      "Não especificada"}
                  </strong>

                </div>

              </div>


              <div className="provider-project-detail">

                <span className="provider-project-detail-icon">
                  📍
                </span>

                <div>

                  <span>
                    Localização
                  </span>

                  <strong>
                    {project.location ||
                      "Não especificada"}
                  </strong>

                </div>

              </div>


              <div className="provider-project-detail">

                <span className="provider-project-detail-icon">
                  💰
                </span>

                <div>

                  <span>
                    Orçamento
                  </span>

                  <strong>

                    {project.budget !== null &&
                    project.budget !== undefined
                      ? `${Number(
                          project.budget
                        ).toLocaleString(
                          "pt-MZ"
                        )} MT`
                      : "Não definido"}

                  </strong>

                </div>

              </div>


              <div className="provider-project-detail">

                <span className="provider-project-detail-icon">
                  🔓
                </span>

                <div>

                  <span>
                    Estado
                  </span>

                  <strong>
                    Projeto aberto
                  </strong>

                </div>

              </div>


            </div>


          </section>


          {/* =================================================
              PROPOSTA
          ================================================= */}

          <section className="provider-project-card provider-project-proposal-card">


            <div className="provider-project-card-header">

              <div className="provider-project-card-icon proposal-icon">
                💼
              </div>

              <div>

                <span className="provider-project-card-label">
                  OPORTUNIDADE
                </span>

                <h2>
                  Enviar proposta
                </h2>

              </div>

            </div>


            <p className="provider-project-proposal-intro">

              Apresente o seu valor e explique ao cliente
              por que você é a pessoa certa para realizar
              este projeto.

            </p>


            {/* ERRO */}

            {error && (

              <div className="provider-project-alert provider-project-alert-error">

                <span>
                  ⚠️
                </span>

                <p>
                  {error}
                </p>

              </div>

            )}


            {/* SUCESSO */}

            {success && (

              <div className="provider-project-alert provider-project-alert-success">

                <span>
                  ✓
                </span>

                <p>
                  {success}
                </p>

              </div>

            )}


            <form
              onSubmit={handleSubmitProposal}
              className="provider-project-proposal-form"
            >


              {/* PREÇO */}

              <div className="provider-project-form-group">

                <label htmlFor="proposal-price">
                  Valor da proposta
                </label>

                <div className="provider-project-price-input">

                  <input
                    id="proposal-price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={price}
                    onChange={(event) =>
                      setPrice(event.target.value)
                    }
                    placeholder="Ex: 4.500"
                    disabled={sending}
                  />

                  <span>
                    MT
                  </span>

                </div>

                <small>
                  Defina o valor que pretende cobrar
                  pelo projeto.
                </small>

              </div>


              {/* MENSAGEM */}

              <div className="provider-project-form-group">

                <label htmlFor="proposal-message">
                  Mensagem para o cliente
                </label>

                <textarea
                  id="proposal-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Explique a sua experiência, prazo de execução, materiais incluídos e outros detalhes importantes..."
                  rows="7"
                  disabled={sending}
                />

                <small>
                  Uma boa mensagem ajuda o cliente a
                  entender a sua proposta.
                </small>

              </div>


              {/* BOTÃO */}

              <button
                type="submit"
                className="provider-project-submit"
                disabled={sending}
              >

                {sending ? (

                  <>
                    <span className="provider-project-button-spinner" />
                    Enviando proposta...
                  </>

                ) : (

                  <>
                    Enviar proposta
                    <span>
                      →
                    </span>
                  </>

                )}

              </button>


            </form>


          </section>


        </div>


      </main>

    </div>

  );

}


export default ProviderProject;