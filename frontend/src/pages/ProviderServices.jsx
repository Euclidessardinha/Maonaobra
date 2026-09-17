
import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  getMyServices,
  updateService,
  toggleServiceStatus,
  deleteService
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

