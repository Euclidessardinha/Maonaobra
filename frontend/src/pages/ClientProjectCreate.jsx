import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { createProject } from "../api/projects";
import { getCategories } from "../api/api";


function ClientProjectCreate() {

  const {
    user,
  } = useAuth();


  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

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


        <a
          href="/client"
          className="sidebar-logout"
          style={{
            textDecoration: "none",
            textAlign: "center"
          }}
        >
          Voltar
        </a>

      </aside>


      <main className="dashboard-content">

        <div className="dashboard-header">

          <div>

            <span className="section-label">
              PUBLICAR PROJETO
            </span>

            <h1>
              Publicar novo projeto
            </h1>

            <p>
              Descreva o serviço que precisa e
              encontre profissionais qualificados.
            </p>

          </div>

        </div>


        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Informações do projeto
              </h2>

              <p>
                Preencha os dados abaixo.
              </p>

            </div>

          </div>


          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          {success && (

            <div
              className="success-message"
              style={{
                marginBottom: "20px"
              }}
            >
              {success}
            </div>

          )}


          <form
            onSubmit={handleSubmit}
            style={{
              maxWidth: "700px"
            }}
          >

            <div className="form-group">

              <label>
                Título do projeto *
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex: Instalação elétrica na minha residência"
                disabled={loading}
              />

            </div>


            <div className="form-group">

              <label>
                Descrição *
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Descreva detalhadamente o serviço que precisa..."
                rows={6}
                disabled={loading}
              />

            </div>


            <div className="form-group">

              <label>
                Categoria *
              </label>


              {loadingCategories ? (

                <p>
                  Carregando categorias...
                </p>

              ) : (

                <select
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


            <div className="form-group">

              <label>
                Localização *
              </label>

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Ex: Beira, Macurungo"
                disabled={loading}
              />

            </div>


            <div className="form-group">

              <label>
                Orçamento (MT)
              </label>

              <input
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

              <small>
                Opcional. Deixe vazio caso ainda não
                tenha definido um orçamento.
              </small>

            </div>


            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "25px"
              }}
            >

              <button
                type="submit"
                className="register-btn"
                disabled={
                  loading ||
                  loadingCategories ||
                  categories.length === 0
                }
              >

                {loading
                  ? "Publicando..."
                  : "Publicar projeto"}

              </button>


              <a
                href="/client"
                className="login-btn"
                style={{
                  textDecoration: "none"
                }}
              >
                Cancelar
              </a>

            </div>

          </form>

        </section>

      </main>

    </div>

  );

}


export default ClientProjectCreate;