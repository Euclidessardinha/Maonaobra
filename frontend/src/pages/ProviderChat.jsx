
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";

import NotificationBell from "../components/NotificationBell";

import {
  markConversationNotificationsAsRead
} from "../api/notifications";

import {
  getMyConversations,
  getConversationMessages,
  sendMessage
} from "../api/chat";

import "./ProviderChat.css";


export default function ProviderChat() {

  const { user, logout } = useAuth();

  /* =========================
     DASHBOARD / NAVIGATION
  ========================= */

  const [menuOpen, setMenuOpen] = useState(false);

  function handleClientMode() {
    window.location.href = "/client";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    logout();
  }

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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


  /* =========================
     CHAT STATE
  ========================= */

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);


  /* =========================
     HELPERS
  ========================= */

  function getInitials(name) {

    if (!name) {
      return "?";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }


  function formatTime(dateValue) {

    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("pt-MZ", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }


  function formatConversationTime(dateValue) {

    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const sameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (sameDay) {
      return date.toLocaleTimeString("pt-MZ", {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    return date.toLocaleDateString("pt-MZ", {
      day: "2-digit",
      month: "2-digit"
    });
  }


  function getConversationIdFromUrl() {

    const params = new URLSearchParams(window.location.search);

    const value = params.get("conversation_id");

    if (!value) {
      return null;
    }

    const id = Number(value);

    return Number.isNaN(id) ? null : id;
  }


  function getCurrentUserId() {

    try {

      const token = localStorage.getItem("access_token");

      if (!token) {
        return null;
      }

      const payload = JSON.parse(
        atob(
          token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      if (payload?.sub) {
        return Number(payload.sub);
      }

      return null;

    } catch {
      return null;
    }
  }


  function getClientName(conversation) {

    if (!conversation) {
      return "Cliente";
    }

    return (
      conversation.client_name ||
      conversation.user_name ||
      conversation.other_user_name ||
      conversation.name ||
      "Cliente"
    );
  }


  function getLastMessage(conversation) {

    if (!conversation) {
      return "";
    }

    return (
      conversation.last_message ||
      conversation.last_message_content ||
      conversation.message ||
      "Nenhuma mensagem ainda"
    );
  }


  function scrollToBottom() {

    setTimeout(() => {

      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth"
      });

    }, 50);
  }


  /* =========================
     LOAD CONVERSATIONS
  ========================= */

  async function loadConversations() {

    try {

      setError("");

      const data = await getMyConversations();

      const list = Array.isArray(data)
        ? data
        : data?.conversations || [];

      setConversations(list);

      return list;

    } catch (err) {

      console.error("Erro ao carregar conversas:", err);

      setError(
        err?.message ||
        "Não foi possível carregar as conversas."
      );

      return [];

    } finally {

      setLoading(false);
    }
  }


  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {

    async function initialize() {

      const list = await loadConversations();

      if (!list.length) {
        return;
      }

      const conversationId = getConversationIdFromUrl();

      let conversationToOpen = null;

      if (conversationId) {

        conversationToOpen = list.find(
          (conversation) =>
            Number(conversation.id) === Number(conversationId)
        );
      }

      if (!conversationToOpen) {
        conversationToOpen = list[0];
      }

      if (conversationToOpen) {

        setSelectedConversation(conversationToOpen);

        if (window.innerWidth <= 768) {
          setMobileChatOpen(true);
        }
      }
    }

    initialize();

  }, []);


  /* =========================
     LOAD MESSAGES
  ========================= */

  async function loadMessages(conversationId) {

    if (!conversationId) {
      return;
    }

    try {

      setMessagesLoading(true);
      setError("");

      const data = await getConversationMessages(
        conversationId
      );

      const list = Array.isArray(data)
        ? data
        : data?.messages || [];

      setMessages(list);

    } catch (err) {

      console.error("Erro ao carregar mensagens:", err);

      setError(
        err?.message ||
        "Não foi possível carregar as mensagens."
      );

    } finally {

      setMessagesLoading(false);
    }
  }


  /* =========================
     SELECTED CONVERSATION
  ========================= */

  useEffect(() => {

    if (!selectedConversation?.id) {
      setMessages([]);
      return;
    }

    const conversationId = selectedConversation.id;

    loadMessages(conversationId);

    markConversationNotificationsAsRead(conversationId)
      .catch((err) => {
        console.error(
          "Erro ao marcar notificações:",
          err
        );
      });

  }, [selectedConversation]);


  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {

    if (messages.length > 0) {
      scrollToBottom();
    }

  }, [messages]);


  /* =========================
     POLLING
  ========================= */

  useEffect(() => {

    if (!selectedConversation?.id) {
      return;
    }

    const interval = setInterval(() => {

      loadMessages(selectedConversation.id);

    }, 3000);

    return () => {
      clearInterval(interval);
    };

  }, [selectedConversation?.id]);


  /* =========================
     SEND MESSAGE
  ========================= */

  async function handleSendMessage(event) {

    event.preventDefault();

    const text = message.trim();

    if (!text) {
      return;
    }

    if (!selectedConversation?.id) {
      return;
    }

    if (sending) {
      return;
    }

    try {

      setSending(true);
      setError("");

      const newMessage = await sendMessage(
        selectedConversation.id,
        text
      );

      setMessage("");

      if (newMessage) {

        setMessages((previous) => [
          ...previous,
          newMessage
        ]);

      } else {

        await loadMessages(
          selectedConversation.id
        );
      }

      scrollToBottom();

      await loadConversations();

    } catch (err) {

      console.error("Erro ao enviar mensagem:", err);

      setError(
        err?.message ||
        "Não foi possível enviar a mensagem."
      );

    } finally {

      setSending(false);
    }
  }


  /* =========================
     SELECT CONVERSATION
  ========================= */

  function handleSelectConversation(conversation) {

    setSelectedConversation(conversation);

    setMessages([]);

    window.history.replaceState(
      {},
      "",
      `/provider/chat?conversation_id=${conversation.id}`
    );

    if (window.innerWidth <= 768) {
      setMobileChatOpen(true);
    }
  }


  /* =========================
     MOBILE BACK
  ========================= */

  function handleMobileBack() {

    setMobileChatOpen(false);

    window.history.replaceState(
      {},
      "",
      "/provider/chat"
    );
  }


  /* =========================
     FILTER
  ========================= */

  const filteredConversations =
    conversations.filter((conversation) => {

      const name = getClientName(
        conversation
      ).toLowerCase();

      return name.includes(
        search.toLowerCase()
      );
    });


  const currentUserId = getCurrentUserId();


  /* =========================
     RENDER
  ========================= */

  return (
    <div className="provider-chat-page">

      {/* =========================
          MOBILE HEADER
      ========================= */}

      <header className="provider-mobile-header">

        <button
          className="provider-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="provider-mobile-logo">
          Mão<span>NaObra</span>
        </div>

        <div className="provider-mobile-notification">
          <NotificationBell />
        </div>

      </header>


      {/* =========================
          SIDEBAR OVERLAY
      ========================= */}

      {menuOpen && (
        <div
          className="provider-sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}


      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`provider-sidebar ${
          menuOpen
            ? "provider-sidebar-open"
            : ""
        }`}
      >

        <button
          className="provider-sidebar-close"
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          ×
        </button>


        <div className="provider-sidebar-brand">

          <div className="provider-brand-mark">
            M
          </div>

          <div>

            <div className="provider-brand-name">
              Mão<span>NaObra</span>
            </div>

            <div className="provider-brand-area">
              Área profissional
            </div>

          </div>

        </div>


        <div className="provider-area-badge">

          <div className="provider-area-icon">
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


        <div className="provider-nav-title">
          MENU PRINCIPAL
        </div>


        <nav className="provider-sidebar-nav">

          <a
            href="/provider"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ◈
            </span>

            <span>
              Visão geral
            </span>
          </a>


          <a
            href="/provider/services"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              🔧
            </span>

            <span>
              Meus serviços
            </span>
          </a>


          <a
            href="/provider/services/new"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ＋
            </span>

            <span>
              Criar serviço
            </span>
          </a>


          <a
            href="/provider/requests"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ▣
            </span>

            <span>
              Pedidos recebidos
            </span>
          </a>


          <a
            href="/provider/projects"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ◉
            </span>

            <span>
              Projetos disponíveis
            </span>
          </a>


          <a
            href="/provider/chat"
            onClick={closeMenu}
            className="provider-nav-link provider-messages-link active"
          >
            <span className="provider-nav-icon provider-messages-icon">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >

                <path
                  d="M20 11.5C20 16.194 16.194 20 11.5 20C10.337 20 9.222 19.766 8.21 19.343L4 20L4.657 15.79C4.234 14.778 4 13.663 4 12.5C4 7.806 7.806 4 12.5 4C17.194 4 20 7.806 20 11.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M8 12H8.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M12 12H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M16 12H16.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

              </svg>

            </span>

            <span className="provider-messages-label">
              Mensagens
            </span>

            <span className="provider-messages-status">
              <span className="provider-messages-status-dot"></span>
            </span>

          </a>


          <a
            href="/provider/reviews"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ★
            </span>

            <span>
              Avaliações
            </span>
          </a>


          <div className="provider-nav-divider"></div>


          <div className="provider-nav-title">
            CONTA
          </div>


          <a
            href="/provider/profile"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ○
            </span>

            <span>
              Meu perfil
            </span>
          </a>


          <a
            href="/"
            onClick={closeMenu}
            className="provider-nav-link"
          >
            <span className="provider-nav-icon">
              ⌂
            </span>

            <span>
              Página inicial
            </span>
          </a>

        </nav>


        {/* =========================
            SIDEBAR BOTTOM
        ========================= */}

        <div className="provider-sidebar-bottom">

          <button
            type="button"
            className="provider-client-mode"
            onClick={handleClientMode}
          >

            <span className="provider-client-mode-icon">
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

            <span className="provider-client-arrow">
              →
            </span>

          </button>


          <div className="provider-sidebar-user">

            <div className="provider-user-avatar">
              {getInitials(user?.name)}
            </div>

            <div className="provider-user-info">

              <strong>
                {user?.name || "Prestador"}
              </strong>

              <span>
                Prestador
              </span>

            </div>

          </div>


          <button
            onClick={handleLogout}
            className="provider-logout"
          >
            <span>
              ↪
            </span>

            Sair da conta

          </button>

        </div>

      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="provider-main">


        {/* =========================
            TOPBAR
        ========================= */}

        <header className="provider-topbar">

          <div className="provider-page-heading">

            <div className="provider-heading-label">

              <span className="provider-heading-dot"></span>

              COMUNICAÇÃO

            </div>

            <h1>
              Mensagens
            </h1>

            <p>
              Converse diretamente com os seus clientes.
            </p>

          </div>


          <div className="provider-header-actions">

            <NotificationBell />


            <button
              type="button"
              className="provider-header-client-btn"
              onClick={handleClientMode}
            >
              👤
              <span>
                Área do Cliente
              </span>
            </button>


            <a
              href="/provider/services/new"
              className="provider-create-btn"
            >
              <span>
                ＋
              </span>

              Criar serviço

            </a>

          </div>

        </header>


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="provider-chat-error">
            {error}
          </div>

        )}


        {/* =========================
            CHAT
        ========================= */}

        <section className="provider-chat-container">


          {/* =========================
              CONVERSATION LIST
          ========================= */}

          <aside
            className={`provider-chat-list ${
              mobileChatOpen
                ? "provider-chat-list-hidden-mobile"
                : ""
            }`}
          >

            <div className="provider-chat-list-header">

              <div>

                <h2>
                  Conversas
                </h2>

                <span>
                  {conversations.length}{" "}
                  {conversations.length === 1
                    ? "conversa"
                    : "conversas"}
                </span>

              </div>

            </div>


            <div className="provider-chat-search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Pesquisar conversa..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>


            <div className="provider-conversations">

              {loading ? (

                <div className="provider-chat-empty">

                  <div className="provider-chat-loading-spinner"></div>

                  <p>
                    A carregar conversas...
                  </p>

                </div>

              ) : filteredConversations.length === 0 ? (

                <div className="provider-chat-empty">

                  <div className="provider-chat-empty-icon">
                    💬
                  </div>

                  <strong>
                    {search
                      ? "Nenhuma conversa encontrada"
                      : "Ainda não tem conversas"}
                  </strong>

                  <p>
                    {search
                      ? "Tente pesquisar por outro nome."
                      : "As mensagens dos seus clientes aparecerão aqui."}
                  </p>

                </div>

              ) : (

                filteredConversations.map(
                  (conversation) => {

                    const isSelected =
                      Number(
                        selectedConversation?.id
                      ) === Number(
                        conversation.id
                      );

                    const clientName =
                      getClientName(
                        conversation
                      );

                    return (

                      <button
                        type="button"
                        key={conversation.id}
                        className={`provider-conversation-item ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSelectConversation(
                            conversation
                          )
                        }
                      >

                        <div className="provider-conversation-avatar">

                          {getInitials(
                            clientName
                          )}

                        </div>


                        <div className="provider-conversation-info">

                          <div className="provider-conversation-top">

                            <strong>
                              {clientName}
                            </strong>

                            <span>
                              {formatConversationTime(
                                conversation.updated_at ||
                                conversation.last_message_at ||
                                conversation.created_at
                              )}
                            </span>

                          </div>


                          <div className="provider-conversation-bottom">

                            <p>
                              {getLastMessage(
                                conversation
                              )}
                            </p>

                          </div>

                        </div>

                      </button>

                    );
                  }
                )

              )}

            </div>

          </aside>


          {/* =========================
              CONVERSATION WINDOW
          ========================= */}

          <section
            className={`provider-conversation-window ${
              mobileChatOpen
                ? "provider-conversation-window-mobile-open"
                : ""
            }`}
          >

            {!selectedConversation ? (

              <div className="provider-chat-welcome">

                <div className="provider-chat-welcome-icon">
                  💬
                </div>

                <h2>
                  As suas mensagens
                </h2>

                <p>
                  Selecione uma conversa para começar
                  a conversar com um cliente.
                </p>

              </div>

            ) : (

              <>

                {/* =========================
                    CONVERSATION HEADER
                ========================= */}

                <header className="provider-conversation-header">

                  <button
                    type="button"
                    className="provider-mobile-back"
                    onClick={handleMobileBack}
                    aria-label="Voltar para conversas"
                  >
                    ←
                  </button>


                  <div className="provider-conversation-header-avatar">

                    {getInitials(
                      getClientName(
                        selectedConversation
                      )
                    )}

                  </div>


                  <div className="provider-conversation-header-info">

                    <strong>
                      {getClientName(
                        selectedConversation
                      )}
                    </strong>

                    <span>
                      Cliente
                    </span>

                  </div>

                </header>


                {/* =========================
                    MESSAGES
                ========================= */}

                <div className="provider-messages-area">

                  {messagesLoading && messages.length === 0 ? (

                    <div className="provider-messages-loading">

                      <div className="provider-chat-loading-spinner"></div>

                      <span>
                        A carregar mensagens...
                      </span>

                    </div>

                  ) : messages.length === 0 ? (

                    <div className="provider-no-messages">

                      <div>
                        💬
                      </div>

                      <strong>
                        Nenhuma mensagem ainda
                      </strong>

                      <span>
                        Envie uma mensagem para iniciar
                        a conversa.
                      </span>

                    </div>

                  ) : (

                    messages.map((item, index) => {

                      const senderId =
                        item.sender_id ??
                        item.user_id ??
                        item.sender?.id;

                      const isMine =
                        currentUserId !== null &&
                        Number(senderId) ===
                          Number(currentUserId);

                      return (

                        <div
                          key={
                            item.id ??
                            `${item.created_at}-${index}`
                          }
                          className={`provider-message-row ${
                            isMine
                              ? "mine"
                              : "received"
                          }`}
                        >

                          <div className="provider-message-bubble">

                            <p>
                              {item.content ??
                                item.message ??
                                ""}
                            </p>

                            <span>
                              {formatTime(
                                item.created_at ||
                                item.sent_at
                              )}
                            </span>

                          </div>

                        </div>

                      );

                    })

                  )}

                  <div ref={messagesEndRef} />

                </div>


                {/* =========================
                    MESSAGE FORM
                ========================= */}

                <form
                  className="provider-message-form"
                  onSubmit={handleSendMessage}
                >

                  <input
                    type="text"
                    placeholder="Escreva uma mensagem..."
                    value={message}
                    onChange={(event) =>
                      setMessage(
                        event.target.value
                      )
                    }
                    disabled={sending}
                  />


                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !message.trim()
                    }
                    aria-label="Enviar mensagem"
                  >

                    {sending ? (
                      "..."
                    ) : (
                      "➤"
                    )}

                  </button>

                </form>

              </>

            )}

          </section>

        </section>

      </main>

    </div>
  );
}
