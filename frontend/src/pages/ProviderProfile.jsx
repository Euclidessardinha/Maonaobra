import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  getMyProviderProfile,
  updateMyProviderProfile
} from "../api/provider";

import NotificationBell from "../components/NotificationBell";

import "./ProviderProfile.css";


function ProviderProfile() {

  const { user } = useAuth();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);


  // ============================================================
  // CARREGAR PERFIL
  // ============================================================

  useEffect(() => {

    async function loadProfile() {

      try {

        setLoading(true);
        setError("");

        const data =
          await getMyProviderProfile();

        setProfile(data);

        setProfession(
          data.profession || ""
        );

        setBio(
          data.bio || ""
        );

        setLocation(
          data.location || ""
        );

        setExperienceYears(
          data.experience_years ?? ""
        );

        setHourlyRate(
          data.hourly_rate ?? ""
        );

      } catch (error) {

        console.error(
          "Erro ao carregar perfil profissional:",
          error
        );

        setError(
          error?.message ||
          "Não foi possível carregar o perfil profissional."
        );

      } finally {

        setLoading(false);

      }

    }

    loadProfile();

  }, []);


  // ============================================================
  // ESC + BLOQUEIO DO SCROLL NO MOBILE
  // ============================================================

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

    if (menuOpen) {

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "";

    }

    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";

    };

  }, [menuOpen]);


  // ============================================================
  // FECHAR MENU
  // ============================================================

  function closeMenu() {

    setMenuOpen(false);

  }


  // ============================================================
  // CANCELAR EDIÇÃO
  // ============================================================

  function handleCancelEdit() {

    if (!profile) {

      return;

    }

    setProfession(
      profile.profession || ""
    );

    setBio(
      profile.bio || ""
    );

    setLocation(
      profile.location || ""
    );

    setExperienceYears(
      profile.experience_years ?? ""
    );

    setHourlyRate(
      profile.hourly_rate ?? ""
    );

    setError("");
    setSuccess("");

    setEditing(false);

  }


  // ============================================================
  // GUARDAR ALTERAÇÕES
  // ============================================================

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!profession.trim()) {

      setError(
        "Informe a sua profissão."
      );

      return;

    }

    if (!location.trim()) {

      setError(
        "Informe a sua localização."
      );

      return;

    }

    if (
      experienceYears === "" ||
      Number(experienceYears) < 0
    ) {

      setError(
        "Informe corretamente os anos de experiência."
      );

      return;

    }

    if (
      hourlyRate !== "" &&
      Number(hourlyRate) < 0
    ) {

      setError(
        "Informe corretamente o valor por hora."
      );

      return;

    }


    try {

      setSaving(true);

      const updatedProfile =
        await updateMyProviderProfile({

          profession:
            profession.trim(),

          bio:
            bio.trim(),

          location:
            location.trim(),

          experience_years:
            Number(experienceYears),

          hourly_rate:
            hourlyRate === ""
              ? null
              : Number(hourlyRate)

        });


      const newProfile =
        updatedProfile.profile ||
        updatedProfile;


      setProfile(newProfile);

      setProfession(
        newProfile.profession || ""
      );

      setBio(
        newProfile.bio || ""
      );

      setLocation(
        newProfile.location || ""
      );

      setExperienceYears(
        newProfile.experience_years ?? ""
      );

      setHourlyRate(
        newProfile.hourly_rate ?? ""
      );

      setSuccess(
        "Perfil profissional atualizado com sucesso!"
      );

      setEditing(false);

    } catch (error) {

      console.error(
        "Erro ao atualizar perfil profissional:",
        error
      );

      setError(
        error?.message ||
        "Não foi possível atualizar o perfil profissional."
      );

    } finally {

      setSaving(false);

    }

  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="provider-profile-page">

        <div className="provider-profile-loading">

          <div className="provider-profile-spinner"></div>

          <p>
            A carregar o seu perfil profissional...
          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // ERRO SEM PERFIL
  // ============================================================

  if (!profile) {

    return (

      <div className="provider-profile-page">

        <div className="provider-profile-error-card">

          <div className="provider-profile-error-icon">
            !
          </div>

          <h2>
            Perfil profissional não encontrado
          </h2>

          <p>
            Ainda não foi possível encontrar o seu
            perfil profissional.
          </p>

          {error && (

            <div className="provider-profile-error">
              {error}
            </div>

          )}

          <a
            href="/provider"
            className="provider-profile-back-button"
          >
            ← Voltar ao dashboard
          </a>

        </div>

      </div>

    );

  }


  // ============================================================
  // INICIAIS
  // ============================================================

  const userName =
    user?.name ||
    "Prestador";

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0).toUpperCase()
      )
      .join("") || "P";


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="provider-profile-page">


      {/* ======================================================
          OVERLAY MOBILE
          ====================================================== */}

      {menuOpen && (

        <div
          className="provider-profile-overlay"
          onClick={closeMenu}
        />

      )}


      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`provider-profile-sidebar ${
          menuOpen
            ? "provider-profile-sidebar-open"
            : ""
        }`}
      >

        <div className="provider-profile-sidebar-top">

          <div className="provider-profile-brand">

            <div className="provider-profile-brand-mark">
              M
            </div>

            <div className="provider-profile-brand-name">
              Mão<span>NaObra</span>
            </div>

          </div>


          <button
            type="button"
            className="provider-profile-sidebar-close"
            onClick={closeMenu}
            aria-label="Fechar menu"
          >
            ×
          </button>


          <div className="provider-profile-area-label">

            <span className="provider-profile-area-icon">
              🛠️
            </span>

            <span>
              ÁREA DO PRESTADOR
            </span>

          </div>


          <nav className="provider-profile-nav">

            <a
              href="/provider"
              onClick={closeMenu}
              className="provider-profile-nav-link"
            >
              <span className="provider-profile-nav-icon">
                🏠
              </span>

              <span>
                Dashboard
              </span>
            </a>


            <a
              href="/provider/services"
              onClick={closeMenu}
              className="provider-profile-nav-link"
            >
              <span className="provider-profile-nav-icon">
                🧰
              </span>

              <span>
                Meus serviços
              </span>
            </a>


            <a
              href="/provider/services/new"
              onClick={closeMenu}
              className="provider-profile-nav-link"
            >
              <span className="provider-profile-nav-icon">
                ➕
              </span>

              <span>
                Criar serviço
              </span>
            </a>


            <a
              href="/provider/requests"
              onClick={closeMenu}
              className="provider-profile-nav-link"
            >
              <span className="provider-profile-nav-icon">
                📋
              </span>

              <span>
                Pedidos recebidos
              </span>
            </a>


            <a
              href="/provider/projects"
              onClick={closeMenu}
              className="provider-profile-nav-link"
            >
              <span className="provider-profile-nav-icon">
                📁
              </span>

              <span>
                Projetos disponíveis
              </span>
            </a>


            <a
              href="/provider/chat"
              onClick={closeMenu}
              className="provider-profile-nav-link"
            >
              <span className="provider-profile-nav-icon">
                💬
              </span>

              <span>
                Mensagens
              </span>
            </a>


            <a
              href="/provider/reviews"
              onClick={closeMenu}
              className="provider-profile-nav-link"
            >
              <span className="provider-profile-nav-icon">
                ⭐
              </span>

              <span>
                Avaliações
              </span>
            </a>


            <a
              href="/provider/profile"
              onClick={closeMenu}
              className="provider-profile-nav-link provider-profile-nav-link-active"
            >
              <span className="provider-profile-nav-icon">
                👤
              </span>

              <span>
                Meu perfil
              </span>
            </a>

          </nav>

        </div>


        <div className="provider-profile-sidebar-bottom">

          <a
            href="/client"
            onClick={closeMenu}
            className="provider-profile-bottom-link"
          >
            <span>
              👤
            </span>

            <span>
              Modo Cliente
            </span>
          </a>


          <a
            href="/"
            onClick={closeMenu}
            className="provider-profile-bottom-link"
          >
            <span>
              🌐
            </span>

            <span>
              Página inicial
            </span>
          </a>

        </div>

      </aside>


      {/* ======================================================
          ÁREA PRINCIPAL
          ====================================================== */}

      <div className="provider-profile-main">


        {/* ====================================================
            HEADER
            ==================================================== */}

        <header className="provider-profile-header">

          <div className="provider-profile-header-left">

            <button
              type="button"
              className="provider-profile-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              ☰
            </button>


            <div>

              <span className="provider-profile-header-eyebrow">
                ÁREA DO PRESTADOR
              </span>

              <h1>
                Meu perfil
              </h1>

              <p>
                Consulte e edite as suas informações profissionais
              </p>

            </div>

          </div>


          <div className="provider-profile-header-right">

            <NotificationBell />

            <span className="provider-profile-header-user">
              {userName}
            </span>

          </div>

        </header>


        {/* ====================================================
            CONTEÚDO
            ==================================================== */}

        <main className="provider-profile-content">


          {/* ==================================================
              BANNER PREMIUM
              ================================================== */}

          <section className="provider-profile-hero">

            <div className="provider-profile-hero-decoration provider-profile-hero-decoration-one" />

            <div className="provider-profile-hero-decoration provider-profile-hero-decoration-two" />


            <div className="provider-profile-hero-avatar">

              {initials}

            </div>


            <div className="provider-profile-hero-content">

              <div className="provider-profile-role-badge">

                <span>
                  🛠️
                </span>

                Prestador

              </div>


              <h2>
                {userName}
              </h2>


              <p className="provider-profile-hero-profession">

                {profile.profession ||
                  "Profissional da plataforma"}

              </p>


              <p className="provider-profile-hero-member">

                Membro profissional da plataforma MãoNaObra

              </p>

            </div>


            <div className="provider-profile-hero-side">

              {profile.is_verified ? (

                <div className="provider-profile-hero-verified">

                  <span>
                    ✓
                  </span>

                  Perfil verificado

                </div>

              ) : (

                <div className="provider-profile-hero-status">

                  Perfil profissional

                </div>

              )}

            </div>


            <div className="provider-profile-hero-watermark">
              PROFISSIONAL
            </div>

          </section>


          {/* ==================================================
              TÍTULO + BOTÃO
              ================================================== */}

          <div className="provider-profile-section-heading">

            <div>

              <span className="provider-profile-section-eyebrow">
                PERFIL PROFISSIONAL
              </span>

              <h2>
                Informações profissionais
              </h2>

              <p>
                Mantenha as suas informações profissionais
                atualizadas para apresentar o seu trabalho aos clientes.
              </p>

            </div>


            {!editing && (

              <button
                type="button"
                className="provider-profile-edit-button"
                onClick={() => {

                  setError("");
                  setSuccess("");
                  setEditing(true);

                }}
              >

                <span>
                  ✎
                </span>

                Editar perfil

              </button>

            )}

          </div>


          {/* ==================================================
              ALERTAS
              ================================================== */}

          {error && (

            <div className="provider-profile-alert provider-profile-alert-error">

              <span>
                !
              </span>

              {error}

            </div>

          )}


          {success && (

            <div className="provider-profile-alert provider-profile-alert-success">

              <span>
                ✓
              </span>

              {success}

            </div>

          )}


          {/* ==================================================
              CARTÃO PRINCIPAL
              ================================================== */}

          <section className="provider-profile-card">


            <div className="provider-profile-card-top">

              <div className="provider-profile-card-icon">
                🛠️
              </div>


              <div>

                <h3>
                  Perfil profissional
                </h3>

                <p>
                  Informações utilizadas para apresentar
                  os seus serviços aos clientes.
                </p>

              </div>


              {profile.is_verified && (

                <div className="provider-profile-verified">

                  <span>
                    ✓
                  </span>

                  Verificado

                </div>

              )}

            </div>


            {editing ? (

              <form
                className="provider-profile-form"
                onSubmit={handleSubmit}
              >

                <div className="provider-profile-form-grid">


                  {/* PROFISSÃO */}

                  <div className="provider-profile-field">

                    <label>
                      Profissão
                    </label>

                    <input
                      type="text"
                      value={profession}
                      onChange={(event) =>
                        setProfession(
                          event.target.value
                        )
                      }
                      placeholder="Ex: Eletricista"
                      disabled={saving}
                      required
                    />

                  </div>


                  {/* LOCALIZAÇÃO */}

                  <div className="provider-profile-field">

                    <label>
                      Localização
                    </label>

                    <input
                      type="text"
                      value={location}
                      onChange={(event) =>
                        setLocation(
                          event.target.value
                        )
                      }
                      placeholder="Ex: Beira, Sofala"
                      disabled={saving}
                      required
                    />

                  </div>


                  {/* EXPERIÊNCIA */}

                  <div className="provider-profile-field">

                    <label>
                      Anos de experiência
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="1"
                      value={experienceYears}
                      onChange={(event) =>
                        setExperienceYears(
                          event.target.value
                        )
                      }
                      placeholder="Ex: 5"
                      disabled={saving}
                      required
                    />

                  </div>


                  {/* VALOR */}

                  <div className="provider-profile-field">

                    <label>
                      Valor por hora (MT)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(event) =>
                        setHourlyRate(
                          event.target.value
                        )
                      }
                      placeholder="Ex: 500"
                      disabled={saving}
                    />

                  </div>


                  {/* BIO */}

                  <div className="provider-profile-field provider-profile-field-full">

                    <label>
                      Sobre você
                    </label>

                    <textarea
                      rows="7"
                      value={bio}
                      onChange={(event) =>
                        setBio(
                          event.target.value
                        )
                      }
                      placeholder="Fale sobre a sua experiência, competências e os serviços que pode oferecer..."
                      disabled={saving}
                    />

                  </div>

                </div>


                <div className="provider-profile-form-actions">

                  <button
                    type="button"
                    className="provider-profile-cancel-button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancelar
                  </button>


                  <button
                    type="submit"
                    className="provider-profile-save-button"
                    disabled={saving}
                  >

                    {saving
                      ? "A guardar..."
                      : "Guardar alterações"}

                  </button>

                </div>

              </form>

            ) : (

              <div className="provider-profile-info">


                <div className="provider-profile-info-grid">


                  <div className="provider-profile-info-item">

                    <span>
                      PROFISSÃO
                    </span>

                    <strong>
                      {profile.profession ||
                        "Não informado"}
                    </strong>

                  </div>


                  <div className="provider-profile-info-item">

                    <span>
                      LOCALIZAÇÃO
                    </span>

                    <strong>
                      {profile.location ||
                        "Não informado"}
                    </strong>

                  </div>


                  <div className="provider-profile-info-item">

                    <span>
                      EXPERIÊNCIA
                    </span>

                    <strong>

                      {profile.experience_years ?? 0}{" "}

                      {Number(
                        profile.experience_years
                      ) === 1
                        ? "ano"
                        : "anos"}

                    </strong>

                  </div>


                  <div className="provider-profile-info-item">

                    <span>
                      VALOR POR HORA
                    </span>

                    <strong>

                      {profile.hourly_rate !== null &&
                      profile.hourly_rate !== undefined &&
                      profile.hourly_rate !== ""
                        ? `${Number(
                            profile.hourly_rate
                          ).toLocaleString(
                            "pt-MZ"
                          )} MT`
                        : "Não informado"}

                    </strong>

                  </div>

                </div>


                <div className="provider-profile-bio">

                  <span>
                    SOBRE O PROFISSIONAL
                  </span>

                  <p>

                    {profile.bio
                      ? profile.bio
                      : "Ainda não adicionou uma descrição profissional."}

                  </p>

                </div>


                <div className="provider-profile-location-card">

                  <div className="provider-profile-location-icon">
                    📍
                  </div>

                  <div>

                    <span>
                      ATUAÇÃO
                    </span>

                    <strong>
                      {profile.location ||
                        "Localização não informada"}
                    </strong>

                    <p>
                      Localização indicada no seu perfil profissional.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </section>


          {/* ==================================================
              CONTA
              ================================================== */}

          <section className="provider-account-card">

            <div className="provider-account-header">

              <div className="provider-account-header-icon">
                👤
              </div>

              <div>

                <span>
                  CONTA
                </span>

                <h2>
                  Dados da sua conta
                </h2>

                <p>
                  Informações básicas associadas à sua conta MãoNaObra.
                </p>

              </div>

            </div>


            <div className="provider-account-grid">

              <div className="provider-account-item">

                <span>
                  NOME COMPLETO
                </span>

                <strong>
                  {user?.name ||
                    "Não informado"}
                </strong>

              </div>


              <div className="provider-account-item">

                <span>
                  EMAIL
                </span>

                <strong>
                  {user?.email ||
                    "Não informado"}
                </strong>

              </div>


              <div className="provider-account-item">

                <span>
                  TELEFONE
                </span>

                <strong>
                  {user?.phone ||
                    "Não informado"}
                </strong>

              </div>

            </div>


            <div className="provider-account-note">

              <span>
                🔒
              </span>

              Os dados acima pertencem à sua conta e não
              fazem parte do perfil profissional.

            </div>

          </section>


          {/* ==================================================
              RODAPÉ
              ================================================== */}

          <div className="provider-profile-footer">

            <a href="/provider">
              ← Voltar ao dashboard
            </a>

            <a href="/">
              Página inicial
            </a>

          </div>

        </main>

      </div>

    </div>

  );

}


export default ProviderProfile;