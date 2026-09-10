import { useEffect, useState } from "react";

import { createService } from "../api/services";
import { getCategories } from "../api/api";


function ProviderServiceCreate() {

  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");

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
        "Informe o título do serviço."
      );

      return;

    }


    if (!description.trim()) {

      setError(
        "Informe a descrição do serviço."
      );

      return;

    }


    if (!categoryId) {

      setError(
        "Selecione uma categoria."
      );

      return;

    }


    if (!price || Number(price) <= 0) {

      setError(
        "Informe um preço válido."
      );

      return;

    }


    try {

      setLoading(true);


      await createService({

        category_id: Number(categoryId),

        title: title.trim(),

        description: description.trim(),

        price: Number(price),

      });


      setSuccess(
        "Serviço criado com sucesso!"
      );


      setTitle("");
      setDescription("");
      setCategoryId("");
      setPrice("");


    } catch (error) {

      console.error(error);

      setError(
        error.message ||
        "Erro ao criar serviço."
      );

    } finally {

      setLoading(false);

    }

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


        <a
          href="/provider"
          className="sidebar-logout"
          style={{
            textDecoration: "none",
            textAlign: "center"
          }}
        >
          Voltar
        </a>

      </aside>


      {/* MAIN */}

      <main className="dashboard-content">


        <div className="dashboard-header">

          <div>

            <span className="section-label">
              ÁREA DO PRESTADOR
            </span>

            <h1>
              Criar novo serviço
            </h1>

            <p>
              Publique um serviço para que clientes
              possam encontrá-lo.
            </p>

          </div>

        </div>


        <section className="dashboard-section">


          <div className="section-header">

            <div>

              <h2>
                Informações do serviço
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


            {/* TÍTULO */}

            <div className="form-group">

              <label>
                Título do serviço *
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex: Instalação elétrica residencial"
                disabled={loading}
              />

            </div>


            {/* DESCRIÇÃO */}

            <div className="form-group">

              <label>
                Descrição *
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Descreva detalhadamente o serviço que você oferece..."
                rows={6}
                disabled={loading}
              />

            </div>


            {/* CATEGORIA */}

            <div className="form-group">

              <label>
                Categoria *
              </label>


              {loadingCategories ? (

                <p>
                  Carregando categorias...
                </p>

              ) : categories.length === 0 ? (

                <p>
                  Nenhuma categoria disponível.
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


            {/* PREÇO */}

            <div className="form-group">

              <label>
                Preço (MT) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="Ex: 1500"
                disabled={loading}
              />

            </div>


            {/* BOTÕES */}

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
                  ? "Criando..."
                  : "Criar serviço"}

              </button>


              <a
                href="/provider"
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


export default ProviderServiceCreate;