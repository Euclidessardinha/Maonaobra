
import { useEffect, useState } from "react";

import { getCategories } from "../api/api";

import "./CategoriesPage.css";


function CategoriesPage() {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* =========================================================
     CARREGAR CATEGORIAS
  ========================================================= */

  useEffect(() => {

    async function loadCategories() {

      try {

        const data = await getCategories();

        setCategories(data);

      } catch (err) {

        console.error(
          "Erro ao carregar categorias:",
          err
        );

        setError(
          "Não foi possível carregar as categorias."
        );

      } finally {

        setLoading(false);

      }

    }

    loadCategories();

  }, []);


  /* =========================================================
     CATEGORIA SELECIONADA
  ========================================================= */

  function handleCategoryClick(category) {

    /*
      Por enquanto direcionamos para a área de profissionais
      passando o ID da categoria.

      Mais tarde podemos transformar isto numa pesquisa
      completa por categoria.
    */

    window.location.href =
      `/client/providers?category=${category.id}`;

  }


  return (

    <div className="categories-page">


      {/* =====================================================
         NAVBAR
      ===================================================== */}

      <header className="navbar">

        <a
          href="/"
          className="logo"
        >
          Mão<span>NaObra</span>
        </a>


        <nav>

          <a href="/#inicio">
            Início
          </a>

          <a href="/#servicos">
            Serviços
          </a>

          <span
            className="nav-link activate"
          >
            Categorias
          </span>

        </nav>


        <div className="nav-actions">

          <a
            href="/login"
            className="login-btn"
          >
            Entrar
          </a>

          <a
            href="/register"
            className="register-btn"
          >
            Criar conta
          </a>

        </div>

      </header>


      {/* =====================================================
         HERO DA PÁGINA
      ===================================================== */}

      <section className="categories-hero">

        <div className="categories-hero-content">

          <span className="hero-badge">
            🔧 Encontre o serviço que precisa
          </span>

          <h1>
            Todas as categorias
          </h1>

          <p>
            Explore todas as categorias de serviços
            disponíveis na MãoNaObra e encontre o
            profissional certo para o seu trabalho.
          </p>

        </div>

      </section>


      {/* =====================================================
         CATEGORIAS
      ===================================================== */}

      <main className="all-categories">

        <div className="categories-header">

          <div>

            <span className="section-label">
              CATEGORIAS
            </span>

            <h2>
              Explore nossos serviços
            </h2>

          </div>


          <a
            href="/"
            className="back-home-btn"
          >
            ← Voltar ao início
          </a>

        </div>


        {loading ? (

          <div className="categories-message">

            <div className="loading-spinner"></div>

            <p>
              Carregando categorias...
            </p>

          </div>

        ) : error ? (

          <div className="categories-message error">

            <p>
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>

          </div>

        ) : categories.length === 0 ? (

          <div className="categories-message">

            <p>
              Nenhuma categoria encontrada.
            </p>

          </div>

        ) : (

          <div className="all-category-grid">

            {categories.map((category) => (

              <button
                className="all-category-card"
                key={category.id}
                onClick={() =>
                  handleCategoryClick(category)
                }
              >

                <div className="all-category-icon">
                  🔧
                </div>


                <div className="all-category-content">

                  <h3>
                    {category.name}
                  </h3>

                  <p>
                    {category.description ||
                      "Encontre profissionais especializados nesta categoria."}
                  </p>

                </div>


                <span className="category-arrow">
                  →
                </span>

              </button>

            ))}

          </div>

        )}

      </main>


      {/* =====================================================
         FOOTER
      ===================================================== */}

      <footer>

        <div className="logo">
          Mão<span>NaObra</span>
        </div>

        <p>
          Conectando pessoas a profissionais.
        </p>

        <p className="copyright">
          © 2026 MãoNaObra. Todos os direitos reservados.
        </p>

      </footer>


    </div>

  );

}


export default CategoriesPage;
