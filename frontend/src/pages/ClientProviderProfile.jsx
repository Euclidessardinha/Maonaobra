
import { useEffect, useState } from "react";
import { getProviderById } from "../api/providers";
import { getProviderReviews } from "../api/provider";
import { getServices } from "../api/provider";
import { createServiceRequest } from "../api/requests";
import { createConversation } from "../api/chat";

function ClientProviderProfile() {

  // Obter o ID do profissional diretamente da URL
  // Exemplo: /client/providers/4
  const path = window.location.pathname;
  const id = path.split("/").filter(Boolean).pop();

  const [services, setServices] = useState([]);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [startingChat, setStartingChat] = useState(false);
  const [chatError, setChatError] = useState("");

  const [requestedDate, setRequestedDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {

    async function loadProvider() {

      try {

        setLoading(true);
        setError("");

        const selectedProvider = await getProviderById(id);

        setProvider(selectedProvider);

        const reviewData = await getProviderReviews(
          selectedProvider.id
        );

        setReviews(reviewData.reviews || []);

        const allServices = await getServices();

        const providerServices = allServices.filter(
            (service) =>
                service.provider?.id === selectedProvider.id
        );

        setServices(providerServices);

      } catch (err) {

        setError(
          err.message || "Erro ao carregar profissional."
        );

      } finally {

        setLoading(false);

      }

    }

    loadProvider();

  }, [id]);


    async function handleStartChat() {
    console.log("BOTAO DE CHAT CLICADO");

    if (!provider) {
      return;
    }

    try {
      setStartingChat(true);
      setChatError("");

      const conversation = await createConversation(
        provider.id
      );

      window.location.href =
        `/client/chat?conversation=${conversation.id}`;

    } catch (error) {
      console.error(
        "Erro ao iniciar conversa:",
        error
      );

      setChatError(
        error.message ||
        "Erro ao iniciar conversa."
      );

    } finally {
      setStartingChat(false);
    }
  }


  if (loading) {

    return (
      <div className="dashboard">

        <main className="main-content">

          <p>
            Carregando perfil do profissional...
          </p>

        </main>

      </div>
    );

  }


  if (error) {

    return (
      <div className="dashboard">

        <main className="main-content">

          <div className="error-message">
            {error}
          </div>

          <a href="/client/providers">
            ← Voltar aos profissionais
          </a>

        </main>

      </div>
    );

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

          <a href="/client/providers">
            👷 Profissionais
          </a>

          <a href="/client/reviews">
            ⭐ Avaliações
          </a>

        </nav>

      </aside>


      <main className="main-content">


        <a
          href="/client/providers"
          className="back-link"
        >
          ← Voltar aos profissionais
        </a>


        {/* PERFIL */}

        <section className="provider-profile-header">

          <div className="provider-avatar">

            {provider.name
              ? provider.name.charAt(0).toUpperCase()
              : "P"}

          </div>


          <div className="provider-profile-info">

            <h1>
              {provider.name}
            </h1>

            <h2>
              {provider.profession}
            </h2>

            <p>
              📍 {provider.location || "Localização não informada"}
            </p>

            {provider.is_verified && (

              <span className="verified-badge">
                ✓ Profissional verificado
              </span>

            )}

          </div>

        </section>


        {/* ESTATÍSTICAS */}

        <section className="provider-profile-stats">


          <div className="profile-stat-card">

            <span className="stat-icon">
              ⭐
            </span>

            <strong>
              {provider.average_rating || "0.0"}
            </strong>

            <span>
              Avaliação média
            </span>

          </div>


          <div className="profile-stat-card">

            <span className="stat-icon">
              💬
            </span>

            <strong>
              {provider.total_reviews || 0}
            </strong>

            <span>
              Avaliações
            </span>

          </div>


          <div className="profile-stat-card">

            <span className="stat-icon">
              🏆
            </span>

            <strong>
              {provider.experience_years || 0}
            </strong>

            <span>
              Anos de experiência
            </span>

          </div>


          <div className="profile-stat-card">

            <span className="stat-icon">
              💰
            </span>

            <strong>

              {provider.hourly_rate
                ? `${provider.hourly_rate} MT`
                : "A combinar"}

            </strong>

            <span>
              Preço por hora
            </span>

          </div>


        </section>


        {/* INFORMAÇÕES */}

        <section className="provider-profile-section">

          <h2>
            Sobre o profissional
          </h2>

          <p>

            {provider.bio ||
              "Este profissional ainda não adicionou uma descrição."}

          </p>

        </section>




        {/* SERVIÇOS */}

        <section className="provider-profile-section">

            <div className="section-header">

            <h2>
                🔧 Serviços oferecidos
            </h2>

            <span>
                {services.length} serviço(s)
            </span>

            </div>


            {services.length === 0 ? (

                <div className="empty-state">

                <p>
                     Este profissional ainda não possui serviços cadastrados.
                </p>

                </div>

            ) : (

                <div className="services-list">

                    {services.map((service) => (

                <div
                    className="service-card"
                    key={service.id}
                >

                <div>

                    <h3>
                        {service.title}
                    </h3>

                    <p>
                        {service.description}
                    </p>

                </div>

                <div>

                    <strong>
                        {service.price} MT
                    </strong>

                    <p>
                        Preço do serviço
                    </p>

                    <button
                        className="primary-button"
                        onClick={() => {
                            setSelectedService(service);
                            setSuccessMessage("");
                            setError("");
                        }}
                    >
                        🔵 Solicitar este serviço
                    </button>

                    <button className="secondary-btn" onClick={handleStartChat} disabled={startingChat}>
                      {startingChat ? "Abrindo conversa..." : "💬 Enviar mensagem"}
                    </button>

                </div>

            </div>

                ))}

            </div>

            )}

        </section>



            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}



        {selectedService && (

            <section className="provider-profile-section">

                <div className="section-header">

                    <h2>
                        📋 Solicitar serviço
                    </h2>

                    <button
                        type="button"
                        onClick={() => setSelectedService(null)}
                    >
                        ✕ Fechar
                    </button>

                </div>


                <div className="request-selected-service">

                    <h3>
                        {selectedService.title}
                    </h3>

                    <p>
                        {selectedService.description}
                    </p>

                    <strong>
                        {selectedService.price} MT
                    </strong>

                </div>


                <form
                    onSubmit={async (event) => {

                        event.preventDefault();

                        try {

                            setSubmitting(true);
                            setError("");
                            setSuccessMessage("");

                            console.log("Enviando solicitação...");
                            console.log("Serviço:", selectedService);
                            console.log("Descrição:", description);
                            console.log("Localização:", location);
                            console.log("Data:", requestedDate);

                            const result = await createServiceRequest(
                                selectedService.id,
                                description,
                                location,
                                requestedDate || null
                            );

                            console.log("Resposta da API:", result);
                            console.log("Mensagem:", result.message);
                            console.log("Pedido criado:", result.request)
                            setSuccessMessage(
                                result.message ||
                                "Solicitação enviada com sucesso!"
                        );

                        setDescription("");
                        setLocation("");
                        setRequestedDate("");

                        setSelectedService(null);

                    } catch (err) {

                        setError(
                        err.message ||
                        "Erro ao enviar solicitação."
                    );

                    } finally {

                        setSubmitting(false);

                    }

                }}
                >

      <div className="form-group">

        <label>
          Descreva o serviço que precisa
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Explique detalhadamente o que precisa..."
          minLength={10}
          maxLength={2000}
          required
        />

      </div>


      <div className="form-group">

        <label>
          Localização
        </label>

        <input
          type="text"
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
          placeholder="Ex: Beira, Macurungo"
          minLength={2}
          maxLength={200}
          required
        />

      </div>


      <div className="form-group">

        <label>
          Data pretendida
        </label>

        <input
          type="datetime-local"
          value={requestedDate}
          onChange={(event) =>
            setRequestedDate(event.target.value)
          }
        />

      </div>


      {error && (

        <div className="error-message">
          {error}
        </div>

      )}

      {chatError && (
        <div className="error-message">
          {chatError}
        </div>
      )}


      <button
        type="submit"
        className="primary-button"
        disabled={submitting}
      >

        {submitting
          ? "Enviando..."
          : "📨 Enviar solicitação"}

      </button>

    </form>

  </section>

)}




        {/* AVALIAÇÕES */}

        <section className="provider-profile-section">


          <div className="section-header">

            <h2>
              ⭐ Avaliações dos clientes
            </h2>

            <span>
              {reviews.length} avaliação(ões)
            </span>

          </div>


          {reviews.length === 0 ? (

            <div className="empty-state">

              <p>
                Este profissional ainda não possui avaliações.
              </p>

            </div>

          ) : (

            <div className="reviews-list">

              {reviews.map((review) => (

                <div
                  className="review-card"
                  key={review.id}
                >

                  <div className="review-header">

                    <strong>
                      {review.client_name || "Cliente"}
                    </strong>

                    <span>

                      {new Date(
                        review.created_at
                      ).toLocaleDateString("pt-PT")}

                    </span>

                  </div>


                  <div className="review-stars">

                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}

                  </div>


                  {review.comment && (

                    <p>
                      "{review.comment}"
                    </p>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>




      </main>

    </div>

  );

}

export default ClientProviderProfile;

