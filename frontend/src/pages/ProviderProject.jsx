import { useEffect, useState } from "react";
import { getProject, createProposal } from "../api/provider";

function ProviderProject() {

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [price, setPrice] = useState("");

  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

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
            href="/provider"
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

          <a href="/provider/profile">
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
              PROJETO
            </span>

            <h1>
              {project.title}
            </h1>

            <p>
              Confira os detalhes e envie sua proposta.
            </p>

          </div>

          <a
            href="/provider"
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
                Informações fornecidas pelo cliente.
              </p>

            </div>

            <span className="status-badge status-open">
              ABERTO
            </span>

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


        {/* FORMULÁRIO DA PROPOSTA */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Enviar proposta
              </h2>

              <p>
                Mostre ao cliente quanto você cobra
                e explique como pode realizar o projeto.
              </p>

            </div>

          </div>


          <form
            onSubmit={handleSubmitProposal}
            className="proposal-form"
          >

            <div className="proposal-info">

                <span>
                   💼
                </span>

                <p>
                    Defina um preço competitivo e explique ao
                    cliente por que você é a pessoa certa para
                    realizar este projeto.
                </p>
            </div>

            <div className="form-group">

              <label>
                Valor da proposta (MT)
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="Ex: 2500"
                disabled={sending}
              />

            </div>


            <div className="form-group">

              <label>
                Mensagem para o cliente
              </label>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Explique sua experiência, prazo de execução e outros detalhes..."
                rows="6"
                disabled={sending}
              />

            </div>


            <button
              type="submit"
              className="register-btn"
              disabled={sending}
            >

              {sending
                ? "Enviando..."
                : "Enviar proposta"}

            </button>

          </form>

        </section>

      </main>

    </div>

  );

}

export default ProviderProject;