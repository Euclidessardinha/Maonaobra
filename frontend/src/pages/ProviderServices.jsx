
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";



import {
  getMyServices,
  updateService,
  toggleServiceStatus,
  deleteService,
  createServicePromotion,
  getMyServicePromotions,
  cancelServicePromotion,
  getMyPortfolio,
  createPortfolioItem,
  uploadPortfolioImage,
  updatePortfolioItem,
  deletePortfolioItem
} from "../api/provider";


import "./ProviderServices.css";

function ProviderServices() {

  const {
    user
  } = useAuth();

  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(null);

  const [statusError, setStatusError] = useState("");


  const [promotions, setPromotions] = useState([]); 
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionActionLoading, setPromotionActionLoading] = useState(null);
  const [promotionError, setPromotionError] = useState("");
  const [promotionSuccess, setPromotionSuccess] = useState();


  /* =========================================================
     PORTFÓLIO
  ========================================================= */

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioLimit, setPortfolioLimit] = useState(0);
  const [portfolioRemaining, setPortfolioRemaining] = useState(0);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState("");
  const [portfolioSuccess, setPortfolioSuccess] = useState("");
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [portfolioDeleting, setPortfolioDeleting] = useState(null);

  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    completed_at: "",
    image: null
  });

  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);

  const [portfolioEditForm, setPortfolioEditForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    completed_at: ""
  });




  /* =========================================================
     EDIÇÃO
  ========================================================= */

  const [editingService, setEditingService] = useState(null);

  const [editForm, setEditForm] = useState({
    category_id: "",
    title: "",
    description: "",
    price: ""
  });

  const [savingEdit, setSavingEdit] = useState(false);

  const [editError, setEditError] = useState("");

  const [editSuccess, setEditSuccess] = useState("");

  /* =========================================================
     EXCLUSÃO
  ========================================================= */

  const [deletingService, setDeletingService] = useState(null);

  const [deletingServiceLoading, setDeletingServiceLoading] =
    useState(false);

  const [deleteError, setDeleteError] = useState("");

  /* =========================================================
     CARREGAR SERVIÇOS
  ========================================================= */

  useEffect(() => {

    async function loadServices() {

      try {

        setLoading(true);

        setError("");

        const data = await getMyServices();

        setServices(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Erro ao carregar serviços:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os seus serviços."
        );

      } finally {

        setLoading(false);

      }

    }

    loadServices();

  }, []);



  useEffect(() => {
    async function loadPromotions() {
      try {
        setPromotionLoading(true);
        setPromotionError("");

        const data = await getMyServicePromotions();

        setPromotions(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error("Erro ao carregar promoções:", err);

        setPromotionError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as promoções."
        );
      } finally {
        setPromotionLoading(false);
      }
    }

    loadPromotions();
  }, []);



  /* =========================================================
     CARREGAR PORTFÓLIO
  ========================================================= */

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setPortfolioLoading(true);
        setPortfolioError("");

        const data = await getMyPortfolio();

        setPortfolioItems(
          Array.isArray(data.items) ? data.items : []
        );

        setPortfolioLimit(data.portfolio_limit ?? 0);
        setPortfolioRemaining(data.remaining ?? 0);

      } catch (err) {
        console.error("Erro ao carregar portfólio:", err);

        setPortfolioError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o portfólio."
        );
      } finally {
        setPortfolioLoading(false);
      }
    }

    loadPortfolio();
  }, []);



  /* =========================================================
     ESTATÍSTICAS
  ========================================================= */

  const totalServices =
    services.length;

  const activeServices =
    services.filter(
      (service) =>
        service.is_active !== false
    ).length;

  const inactiveServices =
    services.filter(
      (service) =>
        service.is_active === false
    ).length;

  /* =========================================================
     FORMATAR PREÇO
  ========================================================= */

  function formatPrice(price) {

    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {

      return "Preço sob consulta";

    }

    const numericPrice =
      Number(price);

    if (Number.isNaN(numericPrice)) {

      return "Preço sob consulta";

    }

    return `${numericPrice.toLocaleString(
      "pt-MZ"
    )} MT`;

  }


    /* =========================================================
     PLANO ATUAL DO PRESTADOR
  ========================================================= */

  const currentPlan =
    portfolioLimit >= 15
      ? "Premium"
      : portfolioLimit >= 5
        ? "Profissional"
        : "Gratuito";

  const currentPlanPrice =
    currentPlan === "Premium"
      ? "999"
      : currentPlan === "Profissional"
        ? "499"
        : "0";


  /* =========================================================
     VOLTAR
  ========================================================= */

  function handleBack() {

    window.location.href =
      "/provider";

  }

  /* =========================================================
     CRIAR SERVIÇO
  ========================================================= */

  function handleCreateService() {

    window.location.href =
      "/provider/services/new";

  }

  /* =========================================================
     ABRIR EDIÇÃO
  ========================================================= */

  function handleEditService(service) {

    setEditingService(service);

    setEditForm({
      category_id:
        service.category?.id
          ? String(service.category.id)
          : "",

      title:
        service.title || "",

      description:
        service.description || "",

      price:
        service.price !== null &&
        service.price !== undefined
          ? String(service.price)
          : ""
    });

    setEditError("");

    setEditSuccess("");

  }

  /* =========================================================
     FECHAR EDIÇÃO
  ========================================================= */

  function handleCloseEdit() {

    if (savingEdit) {
      return;
    }

    setEditingService(null);

    setEditError("");

    setEditSuccess("");

  }

  /* =========================================================
     ALTERAR CAMPOS
  ========================================================= */

  function handleEditChange(event) {

    const {
      name,
      value
    } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value
    }));

  }

  /* =========================================================
     GUARDAR ALTERAÇÕES
  ========================================================= */

  async function handleSaveEdit(event) {

    event.preventDefault();

    if (!editingService) {
      return;
    }

    setEditError("");

    setEditSuccess("");

    /* ---------------------------------------------------------
       VALIDAÇÕES
    --------------------------------------------------------- */

    const title =
      editForm.title.trim();

    const description =
      editForm.description.trim();

    const categoryId =
      Number(editForm.category_id);

    const price =
      Number(editForm.price);

    if (!categoryId) {

      setEditError(
        "Selecione uma categoria."
      );

      return;

    }

    if (title.length < 3) {

      setEditError(
        "O título deve ter pelo menos 3 caracteres."
      );

      return;

    }

    if (description.length < 10) {

      setEditError(
        "A descrição deve ter pelo menos 10 caracteres."
      );

      return;

    }

    if (
      !editForm.price ||
      Number.isNaN(price) ||
      price <= 0
    ) {

      setEditError(
        "Informe um preço válido maior que zero."
      );

      return;

    }

    try {

      setSavingEdit(true);

      const data =
        await updateService(
          editingService.id,
          {
            category_id: categoryId,
            title,
            description,
            price
          }
        );

      const updatedService =
        data?.service;

      if (!updatedService) {

        throw new Error(
          "O servidor não devolveu os dados atualizados do serviço."
        );

      }

      /* -------------------------------------------------------
         ATUALIZAR CARD LOCALMENTE
      ------------------------------------------------------- */

      setServices((currentServices) =>
        currentServices.map((service) =>
          service.id === editingService.id
            ? updatedService
            : service
        )
      );

      setEditSuccess(
        "Serviço atualizado com sucesso!"
      );

      /* -------------------------------------------------------
         FECHAR MODAL APÓS PEQUENO INTERVALO
      ------------------------------------------------------- */

      setTimeout(() => {

        setEditingService(null);

        setEditSuccess("");

      }, 700);

    } catch (err) {

      console.error(
        "Erro ao atualizar serviço:",
        err
      );

      setEditError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o serviço."
      );

    } finally {

      setSavingEdit(false);

    }

  }

  /* =========================================================
     ATIVAR / DESATIVAR SERVIÇO
  ========================================================= */

  async function handleToggleServiceStatus(service) {

    const serviceId = service.id;

    setStatusError("");

    setUpdatingStatus(serviceId);

    try {

      const data =
        await toggleServiceStatus(serviceId);

      const updatedService =
        data?.service;

      if (!updatedService) {

        throw new Error(
          "O servidor não devolveu os dados atualizados do serviço."
        );

      }

      setServices((currentServices) =>
        currentServices.map((currentService) =>
          currentService.id === serviceId
            ? updatedService
            : currentService
        )
      );

    } catch (err) {

      console.error(
        "Erro ao alterar estado do serviço:",
        err
      );

      setStatusError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar o estado do serviço."
      );

    } finally {

      setUpdatingStatus(null);

    }

  }

  /* =========================================================
     ABRIR CONFIRMAÇÃO DE EXCLUSÃO
  ========================================================= */

  function handleDeleteService(service) {

    setDeletingService(service);

    setDeleteError("");

  }

  /* =========================================================
     CANCELAR EXCLUSÃO
  ========================================================= */

  function handleCloseDelete() {

    if (deletingServiceLoading) {
      return;
    }

    setDeletingService(null);

    setDeleteError("");

  }

  /* =========================================================
     CONFIRMAR EXCLUSÃO
  ========================================================= */

  async function handleConfirmDelete() {

    if (!deletingService) {
      return;
    }

    setDeleteError("");

    try {

      setDeletingServiceLoading(true);

      const data =
        await deleteService(
          deletingService.id
        );

      /* -------------------------------------------------------
         REMOVER SERVIÇO DA LISTA LOCALMENTE
      ------------------------------------------------------- */

      setServices((currentServices) =>
        currentServices.filter(
          (service) =>
            service.id !== deletingService.id
        )
      );

      console.log(
        data?.message ||
        "Serviço excluído com sucesso!"
      );

      setDeletingService(null);

    } catch (err) {

      console.error(
        "Erro ao excluir serviço:",
        err
      );

      setDeleteError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o serviço."
      );

    } finally {

      setDeletingServiceLoading(false);

    }

  }



/* =========================================================
   ENCONTRAR PROMOÇÃO DE UM SERVIÇO
========================================================= */

  function getServicePromotion(serviceId) {
    const servicePromotions = promotions.filter(
      (promotion) =>
        String(promotion.service_id) === String(serviceId)
    );

    return (
      servicePromotions.find(
        (promotion) =>
          promotion.status === "PENDING" ||
          promotion.status === "ACTIVE"
      ) ||
      servicePromotions[0] ||
      null
    );
  }

/* =========================================================
   FORMATAR ESTADO DA PROMOÇÃO
========================================================= */

  function getPromotionStatusLabel(status) {
    const labels = {
      PENDING: "Pendente de aprovação",
      ACTIVE: "Promoção ativa",
      EXPIRED: "Promoção expirada",
      REJECTED: "Promoção rejeitada",
      CANCELLED: "Promoção cancelada",
    };

    return labels[status] || status;
  }

  function formatPromotionDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("pt-MZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

/* =========================================================
   SOLICITAR PROMOÇÃO
========================================================= */

  async function handleCreatePromotion(service) {
    try {
      setPromotionActionLoading(service.id);
      setPromotionError("");
      setPromotionSuccess("");

      await createServicePromotion(service.id);

      const data = await getMyServicePromotions();

      setPromotions(Array.isArray(data) ? data : []);

      setPromotionSuccess(
        `Pedido de promoção do serviço "${service.title}" enviado com   sucesso.`
      );
    } catch (err) {
      console.error("Erro ao solicitar promoção:", err);

      setPromotionError(
        err instanceof Error
          ? err.message
          : "Não foi possível solicitar a promoção."
      );
    } finally {
      setPromotionActionLoading(null);
    }
  }

/* =========================================================
   CANCELAR PROMOÇÃO
========================================================= */

  async function handleCancelPromotion(promotion) {
    const confirmed = window.confirm(
      "Tem certeza de que deseja cancelar esta promoção?"
    );

    if (!confirmed) return;

    try {
      setPromotionActionLoading(promotion.service_id);
      setPromotionError("");
      setPromotionSuccess("");

      await cancelServicePromotion(promotion.id);

      const data = await getMyServicePromotions();

      setPromotions(Array.isArray(data) ? data : []);

      setPromotionSuccess(
        "Promoção cancelada com sucesso."
      );
    } catch (err) {
      console.error("Erro ao cancelar promoção:", err);

      setPromotionError(
        err instanceof Error
          ? err.message
          : "Não foi possível cancelar a promoção."
      );
    } finally {
      setPromotionActionLoading(null);
    }
  }



  /* =========================================================
     ALTERAR FORMULÁRIO DO PORTFÓLIO
  ========================================================= */

  function handlePortfolioChange(event) {
    const { name, value, files } = event.target;

    setPortfolioForm((current) => ({
      ...current,
      [name]: name === "image" ? files?.[0] || null : value
    }));
  }


  /* =========================================================
     CRIAR TRABALHO NO PORTFÓLIO
  ========================================================= */


async function handleCreatePortfolioItem(event) {
  event.preventDefault();

  setPortfolioError("");
  setPortfolioSuccess("");

  if (portfolioItems.length >= portfolioLimit) {
    setPortfolioError(
      "Já atingiu o limite de trabalhos do seu plano."
    );
    return;
  }

  if (portfolioForm.title.trim().length < 2) {
    setPortfolioError("Informe um título válido.");
    return;
  }

  if (portfolioForm.description.trim().length < 2) {
    setPortfolioError("Informe uma descrição.");
    return;
  }

  if (portfolioForm.category.trim().length < 2) {
    setPortfolioError("Informe a categoria do trabalho.");
    return;
  }

  try {
    setPortfolioSaving(true);

    const created = await createPortfolioItem({
      title: portfolioForm.title.trim(),
      description: portfolioForm.description.trim(),
      category: portfolioForm.category.trim(),
      location: portfolioForm.location.trim() || null,
      completed_at: portfolioForm.completed_at || null
    });

    const newItem = created.item;

    if (!newItem?.id) {
      throw new Error(
        "O servidor não devolveu os dados do trabalho."
      );
    }

    // O trabalho já foi criado na base de dados.
    setPortfolioItems((current) => [
      newItem,
      ...current
    ]);

    setPortfolioRemaining((current) =>
      Math.max(0, current - 1)
    );

    const selectedImage = portfolioForm.image;

    setPortfolioForm({
      title: "",
      description: "",
      category: "",
      location: "",
      completed_at: "",
      image: null
    });

    const fileInput = document.getElementById(
      "portfolio-image"
    );

    if (fileInput) fileInput.value = "";

    // Upload separado para evitar duplicação do trabalho.
    if (selectedImage) {
      try {
        const imageData = await uploadPortfolioImage(
          newItem.id,
          selectedImage
        );

        setPortfolioItems((current) =>
          current.map((item) =>
            item.id === newItem.id
              ? { ...item, image_url: imageData.image_url }
              : item
          )
        );

        setPortfolioSuccess(
          "Trabalho e fotografia publicados com sucesso!"
        );

      } catch (imageError) {
        console.error("Erro no upload da fotografia:", imageError);

        setPortfolioError(
          `O trabalho foi criado, mas a fotografia não foi carregada: ${imageError.message}`
        );
      }
    } else {
      setPortfolioSuccess(
        "Trabalho adicionado com sucesso!"
      );
    }

  } catch (err) {
    console.error("Erro ao adicionar trabalho:", err);

    setPortfolioError(
      err instanceof Error
        ? err.message
        : "Não foi possível adicionar o trabalho."
    );
  } finally {
    setPortfolioSaving(false);
  }
}


  /* =========================================================
     ABRIR EDIÇÃO DO TRABALHO
  ========================================================= */

  function handleEditPortfolio(item) {
    setEditingPortfolioItem(item);

    setPortfolioEditForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      location: item.location || "",
      completed_at: item.completed_at || ""
    });

    setPortfolioError("");
    setPortfolioSuccess("");
  }


  /* =========================================================
     GUARDAR EDIÇÃO DO TRABALHO
  ========================================================= */

  async function handleSavePortfolioEdit(event) {
    event.preventDefault();

    if (!editingPortfolioItem) return;

    try {
      setPortfolioSaving(true);
      setPortfolioError("");
      setPortfolioSuccess("");

      const updated = await updatePortfolioItem(
        editingPortfolioItem.id,
        {
          title: portfolioEditForm.title.trim(),
          description: portfolioEditForm.description.trim(),
          category: portfolioEditForm.category.trim(),
          location: portfolioEditForm.location.trim() || null,
          completed_at: portfolioEditForm.completed_at || null
        }
      );

      const updatedItem = updated.item || updated;

      setPortfolioItems((current) =>
        current.map((item) =>
          item.id === editingPortfolioItem.id
            ? { ...item, ...updatedItem }
            : item
        )
      );

      setEditingPortfolioItem(null);
      setPortfolioSuccess("Trabalho atualizado com sucesso!");

    } catch (err) {
      console.error("Erro ao editar trabalho:", err);

      setPortfolioError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o trabalho."
      );
    } finally {
      setPortfolioSaving(false);
    }
  }


  /* =========================================================
     EXCLUIR TRABALHO
  ========================================================= */

  async function handleDeletePortfolio(item) {
    const confirmed = window.confirm(
      `Tem certeza de que deseja excluir "${item.title}" do portfólio?`
    );

    if (!confirmed) return;

    try {
      setPortfolioDeleting(item.id);
      setPortfolioError("");
      setPortfolioSuccess("");

      await deletePortfolioItem(item.id);

      setPortfolioItems((current) =>
        current.filter((currentItem) =>
          currentItem.id !== item.id
        )
      );

      setPortfolioRemaining((current) =>
        Math.min(portfolioLimit, current + 1)
      );

      setPortfolioSuccess("Trabalho excluído com sucesso!");

    } catch (err) {
      console.error("Erro ao excluir trabalho:", err);

      setPortfolioError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir o trabalho."
      );
    } finally {
      setPortfolioDeleting(null);
    }
  }



  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="provider-services-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="provider-services-header">

        <div className="provider-services-header-left">

          <button
            type="button"
            className="provider-services-back"
            onClick={handleBack}
          >
            ←
          </button>

          <div>

            <span className="provider-services-eyebrow">
              ÁREA DO PRESTADOR
            </span>

            <h1>
              Meus Serviços
            </h1>

            <p>
              Gerencie os serviços que você oferece aos clientes.
            </p>

          </div>

        </div>

        <button
          type="button"
          className="provider-services-create-btn"
          onClick={handleCreateService}
        >
          <span>
            +
          </span>

          Criar serviço

        </button>

      </header>


      {/* =====================================================
          BOAS-VINDAS
      ===================================================== */}

      <section className="provider-services-welcome">

        <div>

          <span className="provider-services-welcome-label">
            SEUS SERVIÇOS
          </span>

          <h2>
            Olá, {user?.name || "Prestador"} 👋
          </h2>

          <p>
            Apresente os seus serviços e encontre novos clientes através da MãoNaObra.
          </p>

        </div>

        <div className="provider-services-welcome-icon">
          🛠️
        </div>

      </section>


            {/* =====================================================
          PLANOS E BENEFÍCIOS
      ===================================================== */}

      {!portfolioLoading && (
        <section className="provider-plans-section">

          <div className="provider-plans-heading">
            <span>PLANOS MÃONAOBRA</span>
            <h2>Escolha o plano ideal para si</h2>
            <p>
              Apresente mais trabalhos aos clientes e aproveite
              os limites disponíveis em cada plano.
            </p>
          </div>

          <div className="provider-current-plan">
            <div>
              <span>O SEU PLANO ATUAL</span>
              <h3>{currentPlan}</h3>
              <p>
                {currentPlanPrice} MT/mês
                {" · "}
                {portfolioLimit} trabalhos no portfólio
              </p>
            </div>

            <span className="provider-current-plan-icon">
              ✓
            </span>
          </div>

          <div className="provider-plans-grid">

            <article className={`provider-plan-card ${
              currentPlan === "Gratuito" ? "current" : ""
            }`}>
              <span className="provider-plan-label">
                PLANO GRATUITO
              </span>

              <h3>Gratuito</h3>

              <div className="provider-plan-price">
                0 <small>MT/mês</small>
              </div>

              <ul>
                <li>Gestão dos seus serviços</li>
                <li>Perfil de prestador</li>
                <li>0 trabalhos no portfólio</li>
              </ul>

              {currentPlan === "Gratuito" && (
                <span className="provider-plan-current-label">
                  Plano atual
                </span>
              )}
            </article>

            <article className={`provider-plan-card provider-plan-featured ${
              currentPlan === "Profissional" ? "current" : ""
            }`}>
              <span className="provider-plan-label">
                PLANO PROFISSIONAL
              </span>

              <h3>Profissional</h3>

              <div className="provider-plan-price">
                499 <small>MT/mês</small>
              </div>

              <ul>
                <li>Gestão dos seus serviços</li>
                <li>Perfil de prestador</li>
                <li>Até 5 trabalhos no portfólio</li>
              </ul>

              {currentPlan === "Profissional" ? (
                <span className="provider-plan-current-label">
                  Plano atual
                </span>
              ) : (
                <span className="provider-plan-action-label">
                  Disponível para adesão
                </span>
              )}
            </article>

            <article className={`provider-plan-card ${
              currentPlan === "Premium" ? "current" : ""
            }`}>
              <span className="provider-plan-label">
                PLANO PREMIUM
              </span>

              <h3>Premium</h3>

              <div className="provider-plan-price">
                999 <small>MT/mês</small>
              </div>

              <ul>
                <li>Gestão dos seus serviços</li>
                <li>Perfil de prestador</li>
                <li>Até 15 trabalhos no portfólio</li>
              </ul>

              {currentPlan === "Premium" ? (
                <span className="provider-plan-current-label">
                  Plano atual
                </span>
              ) : (
                <span className="provider-plan-action-label">
                  Disponível para adesão
                </span>
              )}
            </article>

          </div>

          {currentPlan !== "Premium" && (
            <div className="provider-plans-notice">
              <span>💡</span>

              <div>
                <strong>Quer desbloquear mais espaço no portfólio?</strong>

                <p>
                  Contacte a administração para receber as instruções
                  de pagamento e solicitar a adesão ao plano Profissional
                  ou Premium. A ativação será feita após confirmação
                  administrativa. Contacto: 86 626 6266/ 84 174 9151
                </p>
              </div>
            </div>
          )}

        </section>
      )}


      {/* =====================================================
          ESTATÍSTICAS
      ===================================================== */}

      <section className="provider-services-stats">

        <div className="provider-service-stat-card">

          <div className="provider-service-stat-icon">
            🧰
          </div>

          <div>

            <span>
              Total
            </span>

            <strong>
              {totalServices}
            </strong>

          </div>

        </div>


        <div className="provider-service-stat-card">

          <div className="provider-service-stat-icon">
            ✓
          </div>

          <div>

            <span>
              Ativos
            </span>

            <strong>
              {activeServices}
            </strong>

          </div>

        </div>


        <div className="provider-service-stat-card">

          <div className="provider-service-stat-icon">
            ○
          </div>

          <div>

            <span>
              Inativos
            </span>

            <strong>
              {inactiveServices}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <main className="provider-services-content">


{promotionError && (
  <div className="provider-services-status-error">
    <span>!</span>
    <p>{promotionError}</p>
    <button
      type="button"
      onClick={() => setPromotionError("")}
    >
      ×
    </button>
  </div>
)}

{promotionSuccess && (
  <div className="provider-services-promotion-success">
    <span>✓</span>
    <p>{promotionSuccess}</p>
    <button
      type="button"
      onClick={() => setPromotionSuccess("")}
    >
      ×
    </button>
  </div>
)}


        {statusError && (

          <div className="provider-services-status-error">

            <span>
              !
            </span>

            <p>
              {statusError}
            </p>

            <button
              type="button"
              onClick={() => setStatusError("")}
            >
              ×
            </button>

          </div>

        )}


        <div className="provider-services-section-header">

          <div>

            <span>
              CATÁLOGO
            </span>

            <h2>
              Serviços publicados
            </h2>

          </div>

          {services.length > 0 && (

            <span className="provider-services-count">

              {services.length}{" "}

              {services.length === 1
                ? "serviço"
                : "serviços"}

            </span>

          )}

        </div>


        {/* ===================================================
            ERRO
        =================================================== */}

        {error && (

          <div className="provider-services-error">

            <div className="provider-services-error-icon">
              !
            </div>

            <div>

              <strong>
                Não foi possível carregar os serviços
              </strong>

              <p>
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Tentar novamente
            </button>

          </div>

        )}


        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && !error && (

          <div className="provider-services-loading">

            <div className="provider-services-spinner"></div>

            <p>
              A carregar os seus serviços...
            </p>

          </div>

        )}


        {/* ===================================================
            ESTADO VAZIO
        =================================================== */}

        {!loading &&
          !error &&
          services.length === 0 && (

            <div className="provider-services-empty">

              <div className="provider-services-empty-icon">
                🛠️
              </div>

              <h3>
                Ainda não tem serviços
              </h3>

              <p>
                Crie o seu primeiro serviço para começar a apresentar o seu trabalho aos clientes.
              </p>

              <button
                type="button"
                className="provider-services-empty-btn"
                onClick={handleCreateService}
              >
                + Criar primeiro serviço
              </button>

            </div>

          )}


        {/* ===================================================
            GRID DE SERVIÇOS
        =================================================== */}

        {!loading &&
          !error &&
          services.length > 0 && (

            <div className="provider-services-grid">

              {services.map((service) => (

                <article
                  className={`provider-service-card ${
                    service.is_active === false
                      ? "provider-service-card-inactive"
                      : ""
                  }`}
                  key={service.id}
                >

                  {/* =========================================
                      CARD HEADER
                  ========================================= */}

                  <div className="provider-service-card-header">

                    <div className="provider-service-card-icon">
                      🛠️
                    </div>

                    <span
                      className={`provider-service-status ${
                        service.is_active === false
                          ? "inactive"
                          : "active"
                      }`}
                    >

                      <span className="provider-service-status-dot"></span>

                      {service.is_active === false
                        ? "Inativo"
                        : "Ativo"}

                    </span>

                  </div>


                  {/* =========================================
                      CONTEÚDO
                  ========================================= */}

                  <div className="provider-service-card-body">

                    <span className="provider-service-category">

                      {service.category?.name ||
                        "Sem categoria"}

                    </span>

                    <h3>
                      {service.title}
                    </h3>

                    <p className="provider-service-description">

                      {service.description ||
                        "Sem descrição disponível."}

                    </p>

                    <div className="provider-service-price">

                      <span>
                        A partir de
                      </span>

                      <strong>
                        {formatPrice(service.price)}
                      </strong>

                    </div>


{/* PROMOÇÃO DO SERVIÇO */}

{(() => {
  const promotion = getServicePromotion(service.id);

  if (
    promotion &&
    ["PENDING", "ACTIVE"].includes(promotion.status)
  ) {
    return (
      <div className="provider-service-promotion">

        <strong>
          {getPromotionStatusLabel(promotion.status)}
        </strong>

        {promotion.status === "ACTIVE" && (
          <p>
            Expira em: {formatPromotionDate(promotion.expires_at)}
          </p>
        )}

        {promotion.status === "PENDING" && (
          <p>
            O pedido aguarda aprovação do administrador.
          </p>
        )}

        <button
          type="button"
          className="provider-service-promotion-cancel"
          onClick={() => handleCancelPromotion(promotion)}
          disabled={promotionActionLoading === service.id}
        >
          {promotionActionLoading === service.id
            ? "A cancelar..."
            : "Cancelar promoção"}
        </button>

      </div>
    );
  }

  return (
    <div className="provider-service-promotion">

      <p>
        Destaque este serviço para alcançar mais clientes.
      </p>

      <button
        type="button"
        className="provider-service-promotion-create"
        onClick={() => handleCreatePromotion(service)}
        disabled={
          service.is_active === false ||
          promotionActionLoading === service.id ||
          promotionLoading
        }
      >
        {promotionActionLoading === service.id
          ? "A enviar pedido..."
          : "★ Promover serviço"}
      </button>

      <small>
        100 MT por 7 dias, sujeito à aprovação administrativa.
      </small>

    </div>
  );
})()}


                  </div>


                  {/* =========================================
                      CARD FOOTER
                  ========================================= */}

                  <div className="provider-service-card-footer">

                    <div className="provider-service-location">

                      <span>
                        📍
                      </span>

                      <span>
                        {service.provider?.location ||
                          "Localização não definida"}
                      </span>

                    </div>

                    <div className="provider-service-provider">

                      {service.provider?.is_verified && (

                        <span
                          className="provider-service-verified"
                          title="Prestador verificado"
                        >
                          ✓
                        </span>

                      )}

                    </div>

                  </div>


                  {/* =========================================
                      AÇÕES
                  ========================================= */}

                  <div className="provider-service-card-actions">

                    <button
                      type="button"
                      className="provider-service-edit-btn"
                      onClick={() =>
                        handleEditService(service)
                      }
                      disabled={
                        updatingStatus === service.id ||
                        deletingServiceLoading
                      }
                    >
                      ✏️ Editar
                    </button>


                    <button
                      type="button"
                      className={`provider-service-toggle-btn ${
                        service.is_active === false
                          ? "activate"
                          : "deactivate"
                      }`}
                      onClick={() =>
                        handleToggleServiceStatus(service)
                      }
                      disabled={
                        updatingStatus === service.id ||
                        deletingServiceLoading
                      }
                    >

                      {updatingStatus === service.id ? (

                        <>
                          <span className="provider-service-save-spinner"></span>
                          A atualizar...
                        </>

                      ) : service.is_active === false ? (

                        "✓ Ativar"

                      ) : (

                        "○ Desativar"

                      )}

                    </button>


                    <button
                      type="button"
                      className="provider-service-delete-btn"
                      onClick={() =>
                        handleDeleteService(service)
                      }
                      disabled={
                        updatingStatus === service.id ||
                        deletingServiceLoading
                      }
                    >
                      🗑️ Excluir
                    </button>

                  </div>


                </article>

              ))}

            </div>

          )}


        {/* ===================================================
            PORTFÓLIO — TRABALHOS REALIZADOS
        =================================================== */}

        <section className="provider-portfolio-section">

          <div className="provider-services-section-header">
            <div>
              <span>OS SEUS TRABALHOS</span>
              <h2>Meu Portfólio</h2>
              <p>
                Mostre aos clientes exemplos dos trabalhos que já realizou.
              </p>
            </div>

            <span className="provider-services-count">
              {portfolioItems.length} / {portfolioLimit} trabalhos
            </span>
          </div>

          <div className="provider-portfolio-plan-info">
            <div>
              <strong>Limite do seu plano</strong>
              <p>
                Pode apresentar até {portfolioLimit} trabalhos.
                Ainda tem {portfolioRemaining} vaga(s) disponível(is).
              </p>
            </div>
            <span>📁</span>
          </div>

          {portfolioError && (
            <div className="provider-services-status-error">
              <span>!</span>
              <p>{portfolioError}</p>
              <button
                type="button"
                onClick={() => setPortfolioError("")}
              >
                ×
              </button>
            </div>
          )}

          {portfolioSuccess && (
            <div className="provider-services-promotion-success">
              <span>✓</span>
              <p>{portfolioSuccess}</p>
              <button
                type="button"
                onClick={() => setPortfolioSuccess("")}
              >
                ×
              </button>
            </div>
          )}

          {/* FORMULÁRIO PARA ADICIONAR TRABALHO */}

          {portfolioLimit > 0 && portfolioItems.length < portfolioLimit && (
            <form
              className="provider-portfolio-form"
              onSubmit={handleCreatePortfolioItem}
            >
              <h3>+ Adicionar trabalho realizado</h3>

              <div className="provider-portfolio-form-grid">

                <div className="provider-service-form-group">
                  <label htmlFor="portfolio-title">Título do trabalho</label>
                  <input
                    id="portfolio-title"
                    name="title"
                    type="text"
                    value={portfolioForm.title}
                    onChange={handlePortfolioChange}
                    maxLength={150}
                    placeholder="Ex.: Instalação elétrica residencial"
                    required
                    disabled={portfolioSaving}
                  />
                </div>

                <div className="provider-service-form-group">
                  <label htmlFor="portfolio-category">Categoria</label>
                  <input
                    id="portfolio-category"
                    name="category"
                    type="text"
                    value={portfolioForm.category}
                    onChange={handlePortfolioChange}
                    maxLength={100}
                    placeholder="Ex.: Eletricidade"
                    required
                    disabled={portfolioSaving}
                  />
                </div>

                <div className="provider-service-form-group">
                  <label htmlFor="portfolio-location">Localização</label>
                  <input
                    id="portfolio-location"
                    name="location"
                    type="text"
                    value={portfolioForm.location}
                    onChange={handlePortfolioChange}
                    maxLength={150}
                    placeholder="Ex.: Beira, Sofala"
                    disabled={portfolioSaving}
                  />
                </div>

                <div className="provider-service-form-group">
                  <label htmlFor="portfolio-date">Data de conclusão</label>
                  <input
                    id="portfolio-date"
                    name="completed_at"
                    type="date"
                    value={portfolioForm.completed_at}
                    onChange={handlePortfolioChange}
                    disabled={portfolioSaving}
                  />
                </div>

              </div>

              <div className="provider-service-form-group">
                <label htmlFor="portfolio-description">Descrição do trabalho</label>
                <textarea
                  id="portfolio-description"
                  name="description"
                  value={portfolioForm.description}
                  onChange={handlePortfolioChange}
                  rows={4}
                  placeholder="Descreva o trabalho realizado..."
                  required
                  disabled={portfolioSaving}
                />
              </div>

              <div className="provider-service-form-group">
                <label htmlFor="portfolio-image">
                  Fotografia do trabalho
                </label>
                <input
                  id="portfolio-image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePortfolioChange}
                  disabled={portfolioSaving}
                />
                <small>Formatos: JPG, PNG ou WebP. Máximo: 5 MB.</small>
              </div>

              <button
                type="submit"
                className="provider-portfolio-submit"
                disabled={portfolioSaving}
              >
                {portfolioSaving
                  ? "A guardar trabalho..."
                  : "+ Publicar trabalho"}
              </button>
            </form>
          )}

          {portfolioLimit === 0 && (
            <div className="provider-portfolio-empty">
              <h3>O seu plano atual não inclui portfólio</h3>
              <p>
                Para apresentar trabalhos realizados, será necessário
                um plano Profissional ou Premium.
              </p>
            </div>
          )}

          {/* CARREGAMENTO */}

          {portfolioLoading && (
            <div className="provider-services-loading">
              <div className="provider-services-spinner"></div>
              <p>A carregar os seus trabalhos...</p>
            </div>
          )}

          {/* LISTA DE TRABALHOS */}

          {!portfolioLoading && portfolioItems.length > 0 && (
            <div className="provider-portfolio-grid">
              {portfolioItems.map((item) => (
                <article
                  className="provider-portfolio-card"
                  key={item.id}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="provider-portfolio-image"
                    />
                  ) : (
                    <div className="provider-portfolio-no-image">
                      📷
                      <span>Sem fotografia</span>
                    </div>
                  )}

                  <div className="provider-portfolio-card-body">
                    <span className="provider-service-category">
                      {item.category}
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    {item.location && (
                      <span>📍 {item.location}</span>
                    )}

                    {item.completed_at && (
                      <small>
                        Concluído em:{" "}
                        {new Date(
                          `${item.completed_at}T00:00:00`
                        ).toLocaleDateString("pt-MZ")}
                      </small>
                    )}

                    <div className="provider-portfolio-actions">
                      <button
                        type="button"
                        onClick={() => handleEditPortfolio(item)}
                        disabled={portfolioDeleting === item.id}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePortfolio(item)}
                        disabled={portfolioDeleting === item.id}
                      >
                        {portfolioDeleting === item.id
                          ? "A excluir..."
                          : "🗑️ Excluir"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!portfolioLoading && portfolioItems.length === 0 && portfolioLimit > 0 && (
            <div className="provider-portfolio-empty">
              <span>📁</span>
              <h3>Ainda não tem trabalhos no portfólio</h3>
              <p>
                Adicione fotografias e informações dos trabalhos que já realizou.
              </p>
            </div>
          )}

        </section>

        {/* MODAL DE EDIÇÃO DO PORTFÓLIO */}

        {editingPortfolioItem && (
          <div className="provider-service-modal-overlay">
            <div
              className="provider-service-modal"
              role="dialog"
              aria-modal="true"
            >
              <div className="provider-service-modal-header">
                <div>
                  <span>GESTÃO DO PORTFÓLIO</span>
                  <h2>Editar trabalho</h2>
                </div>

                <button
                  type="button"
                  className="provider-service-modal-close"
                  onClick={() => setEditingPortfolioItem(null)}
                  disabled={portfolioSaving}
                >
                  ×
                </button>
              </div>

              <form
                className="provider-service-edit-form"
                onSubmit={handleSavePortfolioEdit}
              >
                <div className="provider-service-form-group">
                  <label>Título</label>
                  <input
                    value={portfolioEditForm.title}
                    onChange={(event) =>
                      setPortfolioEditForm((current) => ({
                        ...current,
                        title: event.target.value
                      }))
                    }
                    maxLength={150}
                    required
                  />
                </div>

                <div className="provider-service-form-group">
                  <label>Categoria</label>
                  <input
                    value={portfolioEditForm.category}
                    onChange={(event) =>
                      setPortfolioEditForm((current) => ({
                        ...current,
                        category: event.target.value
                      }))
                    }
                    maxLength={100}
                    required
                  />
                </div>

                <div className="provider-service-form-group">
                  <label>Descrição</label>
                  <textarea
                    rows={4}
                    value={portfolioEditForm.description}
                    onChange={(event) =>
                      setPortfolioEditForm((current) => ({
                        ...current,
                        description: event.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="provider-service-form-group">
                  <label>Localização</label>
                  <input
                    value={portfolioEditForm.location}
                    onChange={(event) =>
                      setPortfolioEditForm((current) => ({
                        ...current,
                        location: event.target.value
                      }))
                    }
                    maxLength={150}
                  />
                </div>

                <div className="provider-service-form-group">
                  <label>Data de conclusão</label>
                  <input
                    type="date"
                    value={portfolioEditForm.completed_at}
                    onChange={(event) =>
                      setPortfolioEditForm((current) => ({
                        ...current,
                        completed_at: event.target.value
                      }))
                    }
                  />
                </div>

                <div className="provider-service-modal-actions">
                  <button
                    type="button"
                    className="provider-service-modal-cancel"
                    onClick={() => setEditingPortfolioItem(null)}
                    disabled={portfolioSaving}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="provider-service-modal-save"
                    disabled={portfolioSaving}
                  >
                    {portfolioSaving
                      ? "A guardar..."
                      : "✓ Guardar alterações"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


      </main>




      {/* =====================================================
          CTA
      ===================================================== */}

      {!loading &&
        !error &&
        services.length > 0 && (

          <section className="provider-services-bottom-cta">

            <div className="provider-services-bottom-icon">
              ✨
            </div>

            <div>

              <h3>
                Quer oferecer outro serviço?
              </h3>

              <p>
                Adicione novos serviços para aumentar as oportunidades de trabalho.
              </p>

            </div>

            <button
              type="button"
              onClick={handleCreateService}
            >
              + Criar serviço
            </button>

          </section>

        )}


      {/* =====================================================
          MODAL — EDITAR SERVIÇO
      ===================================================== */}

      {editingService && (

        <div
          className="provider-service-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget &&
              !savingEdit
            ) {
              handleCloseEdit();
            }

          }}
        >

          <div
            className="provider-service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-service-title"
          >

            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div className="provider-service-modal-header">

              <div>

                <span>
                  GESTÃO DE SERVIÇO
                </span>

                <h2 id="edit-service-title">
                  Editar serviço
                </h2>

                <p>
                  Atualize as informações do seu serviço.
                </p>

              </div>

              <button
                type="button"
                className="provider-service-modal-close"
                onClick={handleCloseEdit}
                disabled={savingEdit}
                aria-label="Fechar"
              >
                ×
              </button>

            </div>


            {/* ===============================================
                FORMULÁRIO
            =============================================== */}

            <form
              className="provider-service-edit-form"
              onSubmit={handleSaveEdit}
            >

              {/* CATEGORIA */}

              <div className="provider-service-form-group">

                <label htmlFor="edit-category">
                  Categoria
                </label>

                <select
                  id="edit-category"
                  name="category_id"
                  value={editForm.category_id}
                  onChange={handleEditChange}
                  disabled={savingEdit}
                  required
                >

                  <option value="">
                    Selecione a categoria
                  </option>

                  {services
                    .map((service) => service.category)
                    .filter(Boolean)
                    .filter(
                      (category, index, array) =>
                        array.findIndex(
                          (item) =>
                            item.id === category.id
                        ) === index
                    )
                    .map((category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>

                    ))}

                </select>

                <small>
                  A categoria atual é apresentada acima.
                </small>

              </div>


              {/* TÍTULO */}

              <div className="provider-service-form-group">

                <label htmlFor="edit-title">
                  Título do serviço
                </label>

                <input
                  id="edit-title"
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  disabled={savingEdit}
                  minLength={3}
                  maxLength={150}
                  placeholder="Ex.: Instalação elétrica"
                  required
                />

              </div>


              {/* DESCRIÇÃO */}

              <div className="provider-service-form-group">

                <label htmlFor="edit-description">
                  Descrição
                </label>

                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  disabled={savingEdit}
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  placeholder="Descreva detalhadamente o serviço que oferece..."
                  required
                />

                <small>
                  {editForm.description.length}/2000 caracteres
                </small>

              </div>


              {/* PREÇO */}

              <div className="provider-service-form-group">

                <label htmlFor="edit-price">
                  Preço
                </label>

                <div className="provider-service-price-input">

                  <input
                    id="edit-price"
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    disabled={savingEdit}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />

                  <span>
                    MT
                  </span>

                </div>

              </div>


              {/* ERRO */}

              {editError && (

                <div className="provider-service-edit-error">

                  <span>
                    !
                  </span>

                  <p>
                    {editError}
                  </p>

                </div>

              )}


              {/* SUCESSO */}

              {editSuccess && (

                <div className="provider-service-edit-success">

                  <span>
                    ✓
                  </span>

                  <p>
                    {editSuccess}
                  </p>

                </div>

              )}


              {/* =============================================
                  AÇÕES DO MODAL
              ============================================= */}

              <div className="provider-service-modal-actions">

                <button
                  type="button"
                  className="provider-service-modal-cancel"
                  onClick={handleCloseEdit}
                  disabled={savingEdit}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="provider-service-modal-save"
                  disabled={savingEdit}
                >

                  {savingEdit ? (

                    <>
                      <span className="provider-service-save-spinner"></span>
                      A guardar...
                    </>

                  ) : (

                    <>
                      ✓ Guardar alterações
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          MODAL — CONFIRMAR EXCLUSÃO
      ===================================================== */}

      {deletingService && (

        <div
          className="provider-service-delete-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget &&
              !deletingServiceLoading
            ) {
              handleCloseDelete();
            }

          }}
        >

          <div
            className="provider-service-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
          >

            <div className="provider-service-delete-icon">
              🗑️
            </div>

            <div className="provider-service-delete-content">

              <span className="provider-service-delete-eyebrow">
                EXCLUIR SERVIÇO
              </span>

              <h2 id="delete-service-title">
                Tem certeza que deseja excluir?
              </h2>

              <p>
                O serviço
                {" "}
                <strong>
                  "{deletingService.title}"
                </strong>
                {" "}
                será removido permanentemente da sua lista.
              </p>

              <p className="provider-service-delete-warning">
                Esta ação não pode ser desfeita.
              </p>

            </div>


            {deleteError && (

              <div className="provider-service-delete-error">

                <span>
                  !
                </span>

                <p>
                  {deleteError}
                </p>

              </div>

            )}


            <div className="provider-service-delete-actions">

              <button
                type="button"
                className="provider-service-delete-cancel"
                onClick={handleCloseDelete}
                disabled={deletingServiceLoading}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="provider-service-delete-confirm"
                onClick={handleConfirmDelete}
                disabled={deletingServiceLoading}
              >

                {deletingServiceLoading ? (

                  <>
                    <span className="provider-service-save-spinner"></span>
                    A excluir...
                  </>

                ) : (

                  <>
                    🗑️ Sim, excluir
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default ProviderServices;

