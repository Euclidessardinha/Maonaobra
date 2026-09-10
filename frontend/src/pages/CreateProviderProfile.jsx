import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createProviderProfile } from "../api/provider";

function CreateProviderProfile() {
  const { user, loadUser } = useAuth();

  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!profession.trim()) {
      setError("Informe a sua profissão.");
      return;
    }

    if (!location.trim()) {
      setError("Informe a sua localização.");
      return;
    }

    if (
      experienceYears === "" ||
      Number(experienceYears) < 0
    ) {
      setError("Informe corretamente os anos de experiência.");
      return;
    }

    try {
      setLoading(true);

      await createProviderProfile({
        profession: profession.trim(),
        bio: bio.trim(),
        location: location.trim(),
        experience_years: Number(experienceYears),
        hourly_rate:
          hourlyRate === ""
            ? null
            : Number(hourlyRate)
      });

      setSuccess(
        "Perfil profissional criado com sucesso!"
      );

      /*
       * Atualiza o usuário no AuthContext.
       * O /auth/me agora devolve:
       *
       * is_provider: true
       * provider_profile_id: ID do perfil
       */
      await loadUser();

      setTimeout(() => {
        window.location.href = "/provider";
      }, 1000);

    } catch (error) {
      console.error(
        "Erro ao criar perfil profissional:",
        error
      );

      setError(
        error?.message ||
        "Não foi possível criar o perfil profissional."
      );

    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="auth-page">

      <div
        className="auth-card"
        style={{
          maxWidth: "650px"
        }}
      >

        <div className="auth-logo">
          Mão<span>NaObra</span>
        </div>

        <h1>
          Criar perfil profissional
        </h1>

        <p>
          Apresente as suas competências e comece
          a oferecer serviços no MãoNaObra.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>
            Profissão
          </label>

          <input
            type="text"
            placeholder="Ex: Eletricista, Pedreiro, Designer..."
            value={profession}
            onChange={(event) =>
              setProfession(event.target.value)
            }
            disabled={loading}
            required
          />


          <label>
            Localização
          </label>

          <input
            type="text"
            placeholder="Ex: Beira, Sofala"
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
            disabled={loading}
            required
          />


          <label>
            Anos de experiência
          </label>

          <input
            type="number"
            min="0"
            step="1"
            placeholder="Ex: 5"
            value={experienceYears}
            onChange={(event) =>
              setExperienceYears(event.target.value)
            }
            disabled={loading}
            required
          />


          <label>
            Valor por hora (MT)
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 500"
            value={hourlyRate}
            onChange={(event) =>
              setHourlyRate(event.target.value)
            }
            disabled={loading}
          />

          <small>
            Este campo é opcional.
          </small>


          <label>
            Sobre você
          </label>

          <textarea
            rows="6"
            placeholder="Fale um pouco sobre a sua experiência, competências e os serviços que pode oferecer..."
            value={bio}
            onChange={(event) =>
              setBio(event.target.value)
            }
            disabled={loading}
          />


          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading
              ? "Criando perfil..."
              : "Criar perfil profissional"}
          </button>

        </form>


        <p className="auth-footer">
          <a href="/client">
            ← Voltar para o dashboard
          </a>
        </p>

      </div>

    </div>
  );
}

export default CreateProviderProfile;