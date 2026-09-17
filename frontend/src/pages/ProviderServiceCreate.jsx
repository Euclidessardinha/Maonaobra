
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import NotificationBell from "../components/NotificationBell";

import { createService } from "../api/services";
import { getCategories } from "../api/api";

import "./ProviderServiceCreate.css";


function ProviderServiceCreate() {

  const { user, logout } = useAuth();

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

  const [menuOpen, setMenuOpen] = useState(false);


  /* =====================================================
     MODO CLIENTE
  ===================================================== */

  function handleClientMode() {

    setMenuOpen(false);

    window.location.href = "/client";

  }


  /* =====================================================
     CARREGAR CATEGORIAS
  ===================================================== */

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


  /* =====================================================
     ESC — FECHAR MENU
  ===================================================== */

  useEffect(() => {

    function handleEscape(event) {

      if (event.key === "Escape") {

        setMenuOpen(false);

      }

    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, []);


  /* =====================================================
     BLOQUEAR SCROLL COM MENU ABERTO
  ===================================================== */

  useEffect(() => {

    if (menuOpen) {

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "";

    }

    return () => {

      document.body.style.overflow = "";

    };

  }, [menuOpen]);


  /* =====================================================
     FECHAR MENU
  ===================================================== */

  const closeMenu = () => {

    setMenuOpen(false);

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    setMenuOpen(false);

    logout();

  };


  /* =====================================================
     INICIAIS DO UTILIZADOR
  ===================================================== */

  function getInitials(name) {

    if (!name) {

      return "P";

    }

    const parts =
      name.trim().split(" ");

    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();

    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }


  /* =====================================================
     CRIAR SERVIÇO
  ===================================================== */

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

    <div className="provider-create-page">


      {/* =====================================================
          HEADER MOBILE
      ===================================================== */}

      <header className="provider-create-mobile-header">

        <button
          className="provider-create-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >

          <span></span>
          <span></span>
          <span></span>

        </button>


        <div className="provider-create-mobile-logo">
          Mão<span>NaObra</span>
        </div>


        <div className="provider-create-mobile-notification">

          <NotificationBell />

        </div>

      </header>


      {/* =====================================================
          OVERLAY
      ===================================================== */}

      {menuOpen && (

        <div
          className="provider-create-sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />

      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={
          `provider-create-sidebar ${
            menuOpen
              ? "provider-create-sidebar-open"
              : ""
          }`
        }
      >


        {/* FECHAR */}

        <button
          className="provider-create-sidebar-close"
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          ×
        </button>


        {/* LOGO */}

        <div className="provider-create-sidebar-brand">

          <div className="provider-create-brand-mark">
            M
          </div>

          <div>

            <div className="provider-create-brand-name">
              Mão<span>NaObra</span>
            </div>

            <div className="provider-create-brand-area">
              Área profissional
            </div>

          </div>

        </div>


        {/* IDENTIDADE DO PRESTADOR */}

        <div className="provider-create-area-badge">

          <div className="provider-create-area-icon">
            🛠️
          </div>

          <div>

            <strong>
              ÁREA DO PRESTADOR
            </strong>

            <span>
              Gerencie o seu trabalho
            </span>

          </div>

        </div>


        {/* TÍTULO DO MENU */}

        <div className="provider-create-nav-title">
          MENU PRINCIPAL
        </div>


        {/* NAVEGAÇÃO */}

        <nav className="provider-create-sidebar-nav">


          <a
            href="/provider"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              ◈
            </span>

            <span>
              Visão geral
            </span>

          </a>


          <a
            href="/provider/services"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              🔧
            </span>

            <span>
              Meus serviços
            </span>

          </a>


          <a
            href="/provider/services/new"
            onClick={closeMenu}
            className="provider-create-nav-link active"
          >

            <span className="provider-create-nav-icon">
              ＋
            </span>

            <span>
              Criar serviço
            </span>

          </a>


          <a
            href="/provider/requests"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              ▣
            </span>

            <span>
              Pedidos recebidos
            </span>

          </a>


          <a
            href="/provider/projects"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              ◉
            </span>

            <span>
              Projetos disponíveis
            </span>

          </a>


          <a
            href="/provider/chat"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              ◌
            </span>

            <span>
              Mensagens
            </span>

          </a>


          <a
            href="/provider/reviews"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              ★
            </span>

            <span>
              Avaliações
            </span>

          </a>


          <div className="provider-create-nav-divider"></div>


          <div className="provider-create-nav-title">
            CONTA
          </div>


          <a
            href="/provider/profile"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              ○
            </span>

            <span>
              Meu perfil
            </span>

          </a>


          <a
            href="/"
            onClick={closeMenu}
            className="provider-create-nav-link"
          >

            <span className="provider-create-nav-icon">
              ⌂
            </span>

            <span>
              Página inicial
            </span>

          </a>


        </nav>


        {/* =================================================
            PARTE INFERIOR
        ================================================= */}

        <div className="provider-create-sidebar-bottom">


          {/* MODO CLIENTE */}

          <button
            type="button"
            className="provider-create-client-mode"
            onClick={handleClientMode}
          >

            <span className="provider-create-client-mode-icon">
              👤
            </span>

            <span>

              <strong>
                Modo Cliente
              </strong>

              <small>
                Procurar profissionais
              </small>

            </span>

            <span className="provider-create-client-arrow">
              →
            </span>

          </button>


          {/* UTILIZADOR */}

          <div className="provider-create-sidebar-user">

            <div className="provider-create-user-avatar">

              {getInitials(user?.name)}

            </div>


            <div className="provider-create-user-info">

              <strong>
                {user?.name || "Prestador"}
              </strong>

              <span>
                Prestador
              </span>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="provider-create-logout"
          >

            <span>
              ↪
            </span>

            Sair da conta

          </button>


        </div>


      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="provider-create-main">


        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="provider-create-topbar">


          <div className="provider-create-page-heading">

            <div className="provider-create-heading-label">

              <span className="provider-create-heading-dot"></span>

              PAINEL PROFISSIONAL

            </div>


            <h1>
              Criar novo serviço
            </h1>


            <p>
              Publique um serviço e permita que clientes
              encontrem o seu trabalho.
            </p>

          </div>


          <div className="provider-create-header-actions">


            <NotificationBell />


            <button
              type="button"
              className="provider-create-header-client-btn"
              onClick={handleClientMode}
            >

              👤

              <span>
                Área do Cliente
              </span>

            </button>


            <a
              href="/provider/services"
              className="provider-create-header-back"
            >

              ←

              <span>
                Meus serviços
              </span>

            </a>


          </div>

        </header>


        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        <section className="provider-create-form-section">


          <div className="provider-create-form-header">

            <div className="provider-create-form-icon">
              🔧
            </div>

            <div>

              <div className="provider-create-form-kicker">
                PUBLICAR SERVIÇO
              </div>

              <h2>
                Informações do serviço
              </h2>

              <p>
                Preencha os dados abaixo para apresentar
                o seu serviço aos clientes.
              </p>

            </div>

          </div>


          <div className="provider-create-form-divider"></div>


          {/* ALERTA DE ERRO */}

          {error && (

            <div className="provider-create-alert error">

              <div className="provider-create-alert-symbol">
                !
              </div>

              <div>

                <strong>
                  Verifique as informações
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>

          )}


          {/* SUCESSO */}

          {success && (

            <div className="provider-create-alert success">

              <div className="provider-create-alert-symbol">
                ✓
              </div>

              <div>

                <strong>
                  Serviço criado com sucesso
                </strong>

                <p>
                  O seu serviço foi publicado na plataforma.
                </p>

              </div>

            </div>

          )}


          <form
            onSubmit={handleSubmit}
            className="provider-create-form"
          >


            {/* TÍTULO */}

            <div className="provider-create-field">

              <label htmlFor="provider-service-title">

                Título do serviço

                <span>*</span>

              </label>


              <input
                id="provider-service-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex: Instalação elétrica residencial"
                disabled={loading}
                maxLength={150}
              />


              <div className="provider-create-help-row">

                <small>
                  Use um título claro e objetivo.
                </small>

                <span>
                  {title.length}/150
                </span>

              </div>

            </div>


            {/* DESCRIÇÃO */}

            <div className="provider-create-field">

              <label htmlFor="provider-service-description">

                Descrição

                <span>*</span>

              </label>


              <textarea
                id="provider-service-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Descreva detalhadamente o serviço que você oferece, sua experiência, o que está incluído e outros detalhes importantes..."
                rows={7}
                disabled={loading}
                maxLength={2000}
              />


              <div className="provider-create-help-row">

                <small>
                  Explique ao cliente exatamente o que ele pode esperar do serviço.
                </small>

                <span>
                  {description.length}/2000
                </span>

              </div>

            </div>


            {/* CATEGORIA + PREÇO */}

            <div className="provider-create-fields-grid">


              {/* CATEGORIA */}

              <div className="provider-create-field">

                <label htmlFor="provider-service-category">

                  Categoria

                  <span>*</span>

                </label>


                {loadingCategories ? (

                  <div className="provider-create-loading-field">

                    <span className="provider-create-mini-spinner"></span>

                    Carregando categorias...

                  </div>

                ) : categories.length === 0 ? (

                  <div className="provider-create-loading-field">

                    Nenhuma categoria disponível.

                  </div>

                ) : (

                  <select
                    id="provider-service-category"
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


                <small>
                  Escolha a categoria mais adequada ao serviço.
                </small>

              </div>


              {/* PREÇO */}

              <div className="provider-create-field">

                <label htmlFor="provider-service-price">

                  Preço

                  <span>*</span>

                </label>


                <div className="provider-create-price">

                  <input
                    id="provider-service-price"
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

                  <span>
                    MT
                  </span>

                </div>


                <small>
                  Informe o valor cobrado pelo serviço.
                </small>

              </div>


            </div>


            {/* =================================================
                AÇÕES
            ================================================= */}

            <div className="provider-create-actions">


              <a
                href="/provider/services"
                className="provider-create-cancel"
              >
                Cancelar
              </a>


              <button
                type="submit"
                className="provider-create-submit"
                disabled={
                  loading ||
                  loadingCategories ||
                  categories.length === 0
                }
              >

                {loading ? (

                  <>

                    <span className="provider-create-button-spinner"></span>

                    Criando serviço...

                  </>

                ) : (

                  <>

                    <span>
                      ✓
                    </span>

                    Criar serviço

                  </>

                )}

              </button>


            </div>


          </form>


        </section>


        {/* =================================================
            DICA
        ================================================= */}

        <div className="provider-create-tip">

          <div className="provider-create-tip-icon">
            💡
          </div>

          <div>

            <strong>
              Dica para conseguir mais clientes
            </strong>

            <p>
              Uma descrição detalhada, uma categoria correta
              e um preço claro ajudam os clientes a entender
              melhor o seu serviço.
            </p>

          </div>

        </div>


      </main>


    </div>

  );

}


export default ProviderServiceCreate;

