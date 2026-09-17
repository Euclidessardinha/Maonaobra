
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { createProject } from "../api/projects";
import { getCategories } from "../api/api";

import "./ClientProjectCreate.css";


function ClientProjectCreate() {

  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {

    async function loadCategories() {

      try {

        setLoadingCategories(true);

        const data = await getCategories();

        setCategories(data);

      } catch (error) {

        console.error(error);

        setError(
          error.message ||
          "Erro ao carregar categorias."
        );

      } finally {

        setLoadingCategories(false);

      }

    }

    loadCategories();

  }, []);


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!title.trim()) {

      setError(
        "Informe o título do projeto."
      );

      return;

    }


    if (!description.trim()) {

      setError(
        "Informe a descrição do projeto."
      );

      return;

    }


    if (!categoryId) {

      setError(
        "Selecione uma categoria."
      );

      return;

    }


    if (!location.trim()) {

      setError(
        "Informe a localização."
      );

      return;

    }


    try {

      setLoading(true);


      const project = await createProject({

        title: title.trim(),

        description: description.trim(),

        category_id: Number(categoryId),

        location: location.trim(),

        budget:
          budget.trim() !== ""
            ? Number(budget)
            : null,

      });


      setSuccess(
        "Projeto publicado com sucesso!"
      );


      setTimeout(() => {

        window.location.href =
          `/client/projects/${project.id}`;

      }, 1000);


    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Erro ao publicar projeto."
      );

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="client-project-create-page">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="client-project-create-navbar">

        <div className="client-project-create-navbar-inner">

          <a
            href="/client"
            className="client-project-create-logo"
          >
            Mão<span>NaObra</span>
          </a>


          <nav className="client-project-create-nav">

            <a href="/client">
              Visão geral
            </a>

            <a
              href="/client/requests"
            >
              Meus pedidos
            </a>

            <a
              href="/client/favorites"
            >
              Favoritos
            </a>

            <a
              href="/client/reviews"
            >
              Avaliações
            </a>

          </nav>


          <div className="client-project-create-user">

            <div className="client-project-create-user-avatar">

              {(user?.name || "U")
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="client-project-create-user-info">

              <strong>
                {user?.name || "Utilizador"}
              </strong>

              <span>
                Área do Cliente
              </span>

            </div>


            <a
              href="/client/profile"
              className="client-project-create-profile-link"
              aria-label="Meu perfil"
            >
              →
            </a>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="client-project-create-main">


        {/* ===================================================
            BREADCRUMB
        ==================================================== */}

        <div className="client-project-create-breadcrumb">

          <a href="/client">
            Área do Cliente
          </a>

          <span>›</span>

          <span>
            Novo projeto
          </span>

        </div>


        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="client-project-create-hero">

          <div className="client-project-create-hero-content">

            <span className="client-project-create-eyebrow">
              PUBLICAR PROJETO
            </span>

            <h1>
              Encontre o profissional
              <br />
              certo para o seu projeto.
            </h1>

            <p>
              Descreva o serviço que precisa,
              receba propostas de profissionais
              e escolha a solução que melhor atende
              às suas necessidades.
            </p>

          </div>


          <div className="client-project-create-hero-badge">

            <div className="client-project-create-hero-icon">
              +
            </div>

            <div>
              <strong>
                Novo projeto
              </strong>

              <span>
                Preencha os detalhes abaixo
              </span>
            </div>

          </div>

        </section>


        {/* ===================================================
            CONTENT GRID
        ==================================================== */}

        <div className="client-project-create-grid">


          {/* =================================================
              FORM CARD
          ================================================== */}

          <section className="client-project-create-card">

            <div className="client-project-create-card-header">

              <div className="client-project-create-card-icon">
                01
              </div>

              <div>

                <span>
                  INFORMAÇÕES
                </span>

                <h2>
                  Conte-nos sobre o seu projeto
                </h2>

                <p>
                  Quanto mais detalhes fornecer,
                  melhores serão as propostas recebidas.
                </p>

              </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================== */}

            {error && (

              <div className="client-project-create-alert error">

                <div className="alert-symbol">
                  !
                </div>

                <div>
                  <strong>
                    Não foi possível continuar
                  </strong>

                  <p>
                    {error}
                  </p>
                </div>

              </div>

            )}


            {success && (

              <div className="client-project-create-alert success">

                <div className="alert-symbol">
                  ✓
                </div>

                <div>
                  <strong>
                    Projeto publicado
                  </strong>

                  <p>
                    {success}
                  </p>
                </div>

              </div>

            )}


            <form
              onSubmit={handleSubmit}
              className="client-project-create-form"
            >


              {/* TITLE */}

              <div className="client-project-create-field">

                <label htmlFor="project-title">
                  Título do projeto
                  <span>*</span>
                </label>

                <p className="field-help">
                  Dê um nome curto e claro ao serviço.
                </p>

                <input
                  id="project-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Ex: Instalação elétrica na minha residência"
                  disabled={loading}
                />

              </div>


              {/* DESCRIPTION */}

              <div className="client-project-create-field">

                <label htmlFor="project-description">
                  Descrição do projeto
                  <span>*</span>
                </label>

                <p className="field-help">
                  Explique o que precisa ser feito,
                  incluindo detalhes importantes.
                </p>

                <textarea
                  id="project-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Descreva detalhadamente o serviço que precisa..."
                  rows={7}
                  disabled={loading}
                />

                <div className="field-counter">
                  {description.length} caracteres
                </div>

              </div>


              {/* CATEGORY + LOCATION */}

              <div className="client-project-create-two-columns">


                <div className="client-project-create-field">

                  <label htmlFor="project-category">
                    Categoria
                    <span>*</span>
                  </label>

                  <p className="field-help">
                    Escolha a área do serviço.
                  </p>


                  {loadingCategories ? (

                    <div className="client-project-create-loading-select">
                      <span></span>
                      Carregando categorias...
                    </div>

                  ) : (

                    <select
                      id="project-category"
                      value={categoryId}
                      onChange={(event) =>
                        setCategoryId(event.target.value)
                      }
                      disabled={loading}
                    >

                      <option value="">
                        Selecione uma categoria
                      </option>

                      {categories.map((category) => (

                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>

                      ))}

                    </select>

                  )}

                </div>


                <div className="client-project-create-field">

                  <label htmlFor="project-location">
                    Localização
                    <span>*</span>
                  </label>

                  <p className="field-help">
                    Indique onde o serviço será realizado.
                  </p>

                  <input
                    id="project-location"
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Ex: Beira, Macurungo"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* BUDGET */}

              <div className="client-project-create-field">

                <label htmlFor="project-budget">
                  Orçamento
                  <span className="optional">
                    Opcional
                  </span>
                </label>

                <p className="field-help">
                  Se já tiver uma estimativa, informe o valor
                  que pretende investir.
                </p>


                <div className="client-project-create-money-input">

                  <input
                    id="project-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget}
                    onChange={(event) =>
                      setBudget(event.target.value)
                    }
                    placeholder="Ex: 1500"
                    disabled={loading}
                  />

                  <span>
                    MT
                  </span>

                </div>

                <small className="client-project-create-input-note">
                  Deixe vazio caso ainda não tenha definido
                  um orçamento.
                </small>

              </div>


              {/* ACTIONS */}

              <div className="client-project-create-actions">

                <a
                  href="/client"
                  className="client-project-create-cancel"
                >
                  Cancelar
                </a>


                <button
                  type="submit"
                  className="client-project-create-submit"
                  disabled={
                    loading ||
                    loadingCategories ||
                    categories.length === 0
                  }
                >

                  {loading ? (

                    <>
                      <span className="create-project-spinner"></span>

                      Publicando...
                    </>

                  ) : (

                    <>
                      Publicar projeto
                      <span>→</span>
                    </>

                  )}

                </button>

              </div>

            </form>

          </section>


          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="client-project-create-sidebar">


            {/* TIPS */}

            <div className="client-project-create-tips">

              <div className="tips-heading">

                <div className="tips-icon">
                  ✦
                </div>

                <div>

                  <span>
                    DICAS
                  </span>

                  <h3>
                    Crie um bom projeto
                  </h3>

                </div>

              </div>


              <div className="tip-item">

                <div className="tip-number">
                  01
                </div>

                <div>

                  <strong>
                    Seja específico
                  </strong>

                  <p>
                    Explique exatamente o que
                    precisa ser feito.
                  </p>

                </div>

              </div>


              <div className="tip-item">

                <div className="tip-number">
                  02
                </div>

                <div>

                  <strong>
                    Adicione detalhes
                  </strong>

                  <p>
                    Informações adicionais ajudam
                    os profissionais a compreender
                    melhor o serviço.
                  </p>

                </div>

              </div>


              <div className="tip-item">

                <div className="tip-number">
                  03
                </div>

                <div>

                  <strong>
                    Indique a localização
                  </strong>

                  <p>
                    Informe onde o serviço será
                    realizado.
                  </p>

                </div>

              </div>


              <div className="tip-item">

                <div className="tip-number">
                  04
                </div>

                <div>

                  <strong>
                    Defina um orçamento
                  </strong>

                  <p>
                    Se possível, indique quanto
                    pretende investir.
                  </p>

                </div>

              </div>

            </div>


            {/* PROCESS */}

            <div className="client-project-create-process">

              <span className="process-label">
                COMO FUNCIONA
              </span>

              <h3>
                Depois de publicar
              </h3>


              <div className="process-step">

                <div>
                  1
                </div>

                <p>
                  Profissionais encontram
                  o seu projeto.
                </p>

              </div>


              <div className="process-line"></div>


              <div className="process-step">

                <div>
                  2
                </div>

                <p>
                  Você recebe propostas
                  e pode compará-las.
                </p>

              </div>


              <div className="process-line"></div>


              <div className="process-step">

                <div>
                  3
                </div>

                <p>
                  Escolha a proposta que
                  melhor atende às suas necessidades.
                </p>

              </div>

            </div>


            {/* TRUST */}

            <div className="client-project-create-trust">

              <div className="trust-icon">
                ✓
              </div>

              <div>

                <strong>
                  Seus dados estão protegidos
                </strong>

                <p>
                  As informações do seu projeto
                  são utilizadas para conectar você
                  aos profissionais adequados.
                </p>

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>

  );

}


export default ClientProjectCreate;

