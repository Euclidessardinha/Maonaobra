
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Onboarding.css";

function Onboarding() {
  const {
    user,
    selectOnboardingArea,
    completeOnboarding
  } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const path = window.location.pathname;

  const isFirstChoice =
    user?.onboarding_type === null &&
    user?.client_onboarding_completed === false &&
    user?.provider_onboarding_completed === false;

  const area = path === "/onboarding/provider"
    ? "PROVIDER"
    : "CLIENT";

  async function chooseArea(selectedArea) {
    try {
      setSaving(true);
      setError("");

      await selectOnboardingArea(selectedArea);

      window.location.href =
        selectedArea === "PROVIDER"
          ? "/onboarding/provider"
          : "/onboarding/client";

    } catch (err) {
      setError(err.message || "Não foi possível selecionar a área.");
      setSaving(false);
    }
  }

  async function finishClientOnboarding() {
    try {
      setSaving(true);
      setError("");

      await completeOnboarding("CLIENT");

      window.location.href = "/client";

    } catch (err) {
      setError(err.message || "Não foi possível concluir o onboarding.");
      setSaving(false);
    }
  }

  function continueProviderOnboarding() {
    window.location.href = "/provider/profile/create";
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-card">

        <div className="onboarding-logo">
          <img src="/favicon-mao4.png" alt="MãoNaObra" />
          <strong>MãoNaObra</strong>
        </div>

        {isFirstChoice ? (
          <>
            <span className="onboarding-label">BEM-VINDO</span>

            <h1>Como pretende utilizar o MãoNaObra?</h1>

            <p>
              Pode utilizar a mesma conta para contratar serviços
              e também trabalhar como profissional.
            </p>

            <div className="onboarding-options">

              <button
                type="button"
                onClick={() => chooseArea("CLIENT")}
                disabled={saving}
                className="onboarding-option"
              >
                <span>👤</span>
                <strong>Quero contratar serviços</strong>
                <small>
                  Encontrar profissionais e acompanhar os meus pedidos.
                </small>
              </button>

              <button
                type="button"
                onClick={() => chooseArea("PROVIDER")}
                disabled={saving}
                className="onboarding-option"
              >
                <span>🛠️</span>
                <strong>Quero oferecer serviços</strong>
                <small>
                  Criar o meu perfil profissional e receber solicitações.
                </small>
              </button>

            </div>
          </>
        ) : area === "CLIENT" ? (
          <>
            <span className="onboarding-label">ÁREA DO CLIENTE</span>

            <h1>Encontre o profissional certo para si.</h1>

            <p>
              Conheça as principais funcionalidades disponíveis
              na sua área de cliente.
            </p>

            <div className="onboarding-steps">
              <div><span>1</span><p><strong>Descubra profissionais</strong><br />Pesquise por categoria e localização.</p></div>
              <div><span>2</span><p><strong>Explore serviços</strong><br />Consulte descrições, preços e profissionais.</p></div>
              <div><span>3</span><p><strong>Solicite e converse</strong><br />Envie pedidos e converse com profissionais.</p></div>
              <div><span>4</span><p><strong>Acompanhe os seus projetos</strong><br />Consulte o progresso e avalie os serviços.</p></div>
            </div>

            <button
              type="button"
              className="onboarding-primary"
              onClick={finishClientOnboarding}
              disabled={saving}
            >
              {saving ? "A guardar..." : "Concluir e entrar na área do cliente"}
            </button>
          </>
        ) : (
          <>
            <span className="onboarding-label">ÁREA DO PRESTADOR</span>

            <h1>Prepare-se para oferecer os seus serviços.</h1>

            <p>
              Vamos ajudá-lo a configurar a sua presença profissional
              no MãoNaObra.
            </p>

            <div className="onboarding-steps">
              <div><span>1</span><p><strong>Complete o seu perfil</strong><br />Apresente a sua profissão, experiência e localização.</p></div>
              <div><span>2</span><p><strong>Escolha as suas categorias</strong><br />Identifique os serviços que pretende oferecer.</p></div>
              <div><span>3</span><p><strong>Publique os seus serviços</strong><br />Adicione descrições, fotografias e preços.</p></div>
              <div><span>4</span><p><strong>Receba solicitações</strong><br />Converse com clientes e acompanhe os pedidos.</p></div>
              <div><span>5</span><p><strong>Conheça as promoções</strong><br />Descubra como destacar os seus serviços.</p></div>
            </div>

            <button
              type="button"
              className="onboarding-primary"
              onClick={continueProviderOnboarding}
            >
              Continuar para criar perfil profissional
            </button>
          </>
        )}

        {error && (
          <p className="onboarding-error">{error}</p>
        )}

        {saving && (
          <p className="onboarding-saving">A processar...</p>
        )}

      </div>
    </main>
  );
}

export default Onboarding;
