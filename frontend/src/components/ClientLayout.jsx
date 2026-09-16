
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import "./ClientLayout.css";


function ClientLayout({
  children,
  activePage = "",
  title,
  subtitle,
  label = "ÁREA DO CLIENTE",
  action
}) {

  const {
    user,
    logout
  } = useAuth();


  const [menuOpen, setMenuOpen] = useState(false);


  /* =========================================================
     FECHAR MENU COM ESC
  ========================================================= */

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


  /* =========================================================
     BLOQUEAR SCROLL QUANDO MENU ESTIVER ABERTO
  ========================================================= */

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


  /* =========================================================
     FECHAR MENU
  ========================================================= */

  function closeMenu() {

    setMenuOpen(false);

  }


  /* =========================================================
     LOGOUT
  ========================================================= */

  function handleLogout() {

    closeMenu();

    logout();

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="client-layout">


      {/* =====================================================
          OVERLAY MOBILE
      ===================================================== */}

      {menuOpen && (

        <div
          className="client-layout-overlay"
          onClick={closeMenu}
        />

      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`client-layout-sidebar ${
          menuOpen
            ? "client-layout-sidebar-open"
            : ""
        }`}
      >


        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="client-layout-logo">

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


        {/* ===================================================
            ÁREA DO CLIENTE
        =================================================== */}

        <div className="client-layout-area-title">

          <span>
            👤
          </span>

          <strong>
            ÁREA DO CLIENTE
          </strong>

        </div>


        {/* ===================================================
            MENU
        =================================================== */}

        <nav className="client-layout-nav">


          {/* DASHBOARD */}

          <a
            href="/client"
            className={`client-layout-nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >

            <span>
              🏠
            </span>

            <span>
              Dashboard
            </span>

          </a>


          {/* MEUS PEDIDOS */}

          <a
            href="/client/requests"
            className={`client-layout-nav-item ${
              activePage === "requests"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >

            <span>
              📋
            </span>

            <span>
              Meus pedidos
            </span>

          </a>


          {/* PROCURAR PROFISSIONAIS */}

          <a
            href="/client/providers"
            className={`client-layout-nav-item ${
              activePage === "providers"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >

            <span>
              🔎
            </span>

            <span>
              Procurar profissionais
            </span>

          </a>


          {/* FAVORITOS */}

          <a
            href="/client/favorites"
            className={`client-layout-nav-item ${
              activePage === "favorites"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >

            <span>
              ❤️
            </span>

            <span>
              Favoritos
            </span>

          </a>


          {/* AVALIAÇÕES */}

          <a
            href="/client/reviews"
            className={`client-layout-nav-item ${
              activePage === "reviews"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >

            <span>
              ⭐
            </span>

            <span>
              Avaliações
            </span>

          </a>


          {/* MENSAGENS */}

          <a
            href="/client/chat"
            className={`client-layout-nav-item ${
              activePage === "chat"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >

            <span>
              💬
            </span>

            <span>
              Mensagens
            </span>

          </a>


          {/* NOTIFICAÇÕES */}



          {/* MEU PERFIL */}

          <a
            href="/client/profile"
            className={`client-layout-nav-item ${
              activePage === "profile"
                ? "active"
                : ""
            }`}
            onClick={closeMenu}
          >

            <span>
              👤
            </span>

            <span>
              Meu perfil
            </span>

          </a>


        </nav>


        {/* ===================================================
            PARTE INFERIOR
        =================================================== */}

        <div className="client-layout-sidebar-bottom">


          {/* PÁGINA INICIAL */}

          <a
            href="/"
            className="client-layout-nav-item"
            onClick={closeMenu}
          >

            <span>
              🌐
            </span>

            <span>
              Página inicial
            </span>

          </a>


          {/* SAIR */}

          <button
            type="button"
            className="client-layout-logout"
            onClick={handleLogout}
          >

            <span>
              🚪
            </span>

            <span>
              Sair
            </span>

          </button>


        </div>


      </aside>


      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ===================================================== */}

      <main className="client-layout-main">


        {/* ===================================================
            HEADER MOBILE
        =================================================== */}

        <header className="client-layout-mobile-header">


          <button
            type="button"
            className="client-layout-hamburger"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Abrir menu"
          >

            <span />
            <span />
            <span />

          </button>


          <div className="client-layout-mobile-title">

            <p>
              ÁREA DO CLIENTE
            </p>

            <strong>
              MãoNaObra
            </strong>

          </div>


          <div className="client-layout-mobile-user">

            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"
            }

          </div>


        </header>


        {/* ===================================================
            HEADER DA PÁGINA
        =================================================== */}

        {(title || subtitle || action) && (

          <header className="client-layout-page-header">


            <div className="client-layout-page-heading">


              {label && (

                <p className="client-layout-section-label">
                  {label}
                </p>

              )}


              {title && (

                <h1>
                  {title}
                </h1>

              )}


              {subtitle && (

                <p>
                  {subtitle}
                </p>

              )}


            </div>


            {action && (

              <div className="client-layout-page-action">

                {action}

              </div>

            )}


          </header>

        )}


        {/* ===================================================
            CONTEÚDO
        =================================================== */}

        <section className="client-layout-content">

          {children}

        </section>


      </main>


    </div>

  );

}


export default ClientLayout;

