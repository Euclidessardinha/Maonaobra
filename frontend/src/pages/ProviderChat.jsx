import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  markConversationNotificationsAsRead
} from "../api/notifications";

import {
  getMyConversations,
  getConversationMessages,
  sendMessage
} from "../api/chat";



function ProviderChat() {

  const { logout } = useAuth();

  const [conversations, setConversations] =
    useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================================================
  // OBTER ID DA CONVERSA PELA URL
  // =========================================================

  function getConversationIdFromUrl() {

    const params =
      new URLSearchParams(window.location.search);

    const conversationId =
      params.get("conversation_id");

    if (!conversationId) {
      return null;
    }

    const parsedId =
      Number(conversationId);

    if (
      Number.isNaN(parsedId) ||
      !Number.isInteger(parsedId)
    ) {
      return null;
    }

    return parsedId;

  }


  // =========================================================
  // CARREGAR CONVERSAS
  // =========================================================

  async function loadConversations() {

    try {

      setLoading(true);
      setError("");

      const data =
        await getMyConversations();


      console.log(
        "Conversas carregadas:",
        data
      );


      setConversations(data);


      // =====================================================
      // VERIFICAR SE EXISTE conversation_id NA URL
      // =====================================================

      const conversationIdFromUrl =
        getConversationIdFromUrl();


      console.log(
        "conversation_id recebido pela URL:",
        conversationIdFromUrl
      );


      // =====================================================
      // SE VEIO DA NOTIFICAÇÃO
      // =====================================================

      if (conversationIdFromUrl) {

        const conversationFromNotification =
          data.find(
            (conversation) =>
              Number(conversation.id) ===
              Number(conversationIdFromUrl)
          );


        console.log(
          "Conversa encontrada pela notificação:",
          conversationFromNotification
        );


        if (conversationFromNotification) {

          setSelectedConversation(
            conversationFromNotification
          );

        } else {

          console.warn(
            "A conversa indicada na notificação não foi encontrada.",
            {
              conversationIdFromUrl,
              conversations: data
            }
          );

        }

      }


      // =====================================================
      // SE NÃO VEIO conversation_id,
      // SELECIONAR PRIMEIRA CONVERSA
      // =====================================================

      if (
        !conversationIdFromUrl &&
        data.length > 0
      ) {

        setSelectedConversation(
          data[0]
        );

      }

    } catch (error) {

      console.error(
        "Erro ao carregar conversas:",
        error
      );

      setError(
        error.message ||
        "Erro ao carregar conversas."
      );

    } finally {

      setLoading(false);

    }

  }


  // =========================================================
  // CARREGAMENTO INICIAL
  // =========================================================

  useEffect(() => {

    loadConversations();

  }, []);


  // =========================================================
  // CARREGAR MENSAGENS
  // =========================================================

  async function loadMessages(conversationId) {

    if (!conversationId) {
      return;
    }

    try {

      setMessagesLoading(true);
      setError("");

      const data =
        await getConversationMessages(
          conversationId
        );


      console.log(
        `Mensagens da conversa ${conversationId}:`,
        data
      );


      setMessages(data);

    } catch (error) {

      console.error(
        "Erro ao carregar mensagens:",
        error
      );

      setError(
        error.message ||
        "Erro ao carregar mensagens."
      );

    } finally {

      setMessagesLoading(false);

    }

  }


  // =========================================================
  // CARREGAR MENSAGENS QUANDO TROCAR DE CONVERSA
  // =========================================================

  useEffect(() => {

    if (!selectedConversation) {
      return;
    }


    async function openConversation() {

      try {

        // ==========================================
        // CARREGAR MENSAGENS
        // ==========================================

        await loadMessages(
          selectedConversation.id
        );


        // ==========================================
        // MARCAR TODAS AS NOTIFICAÇÕES
        // DESTA CONVERSA COMO LIDAS
        // ==========================================

        await markConversationNotificationsAsRead(
          selectedConversation.id
        );


        console.log(
          `Notificações da conversa ${selectedConversation.id} marcadas como lidas.`
        );

      } catch (error) {

        console.error(
          "Erro ao abrir conversa:",
          error
        );

      }

    }


    openConversation();

  }, [selectedConversation]);


  // =========================================================
  // ATUALIZAR MENSAGENS AUTOMATICAMENTE
  // =========================================================

  useEffect(() => {

    if (!selectedConversation) {
      return;
    }

    const interval =
      setInterval(() => {

        loadMessages(
          selectedConversation.id
        );

      }, 3000);


    return () =>
      clearInterval(interval);

  }, [selectedConversation]);


  // =========================================================
  // ENVIAR MENSAGEM
  // =========================================================

  async function handleSendMessage(event) {

    event.preventDefault();

    if (
      !message.trim() ||
      !selectedConversation
    ) {
      return;
    }

    try {

      setSending(true);
      setError("");


      const newMessage =
        await sendMessage(
          selectedConversation.id,
          message.trim()
        );


      setMessages(
        (currentMessages) => [
          ...currentMessages,
          newMessage
        ]
      );


      setMessage("");

    } catch (error) {

      console.error(
        "Erro ao enviar mensagem:",
        error
      );

      setError(
        error.message ||
        "Erro ao enviar mensagem."
      );

    } finally {

      setSending(false);

    }

  }


  // =========================================================
  // OBTER ID DO UTILIZADOR LOGADO
  // =========================================================

  function getCurrentUserId() {

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      return null;
    }

    try {

      const payload =
        JSON.parse(
          atob(
            token.split(".")[1]
          )
        );


      return Number(
        payload.sub
      );

    } catch {

      return null;

    }

  }


  const currentUserId =
    getCurrentUserId();


  // =========================================================
  // INTERFACE
  // =========================================================

  return (

    <div className="dashboard">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="logo">
          Mão<span>NaObra</span>
        </div>


        <nav>

          <a href="/provider">
            🏠 Visão geral
          </a>

          <a href="/provider/services">
            🔧 Meus serviços
          </a>

          <a href="/provider/services/new">
            ➕ Criar serviço
          </a>

          <a href="/provider/requests">
            📋 Pedidos recebidos
          </a>

          <a href="/provider/chat">
            💬 Mensagens
          </a>

          <a href="/provider/profile">
            👤 Meu perfil
          </a>

        </nav>


        <button
          onClick={logout}
          className="sidebar-logout"
        >
          Sair
        </button>

      </aside>


      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ===================================================== */}

      <main className="dashboard-content">


        {/* ===================================================
            CABEÇALHO
        =================================================== */}

        <div className="dashboard-header">

          <div>

            <span className="section-label">
              MENSAGENS
            </span>

            <h1>
              Conversas com clientes 💬
            </h1>

            <p>
              Converse diretamente com os seus clientes.
            </p>

          </div>

        </div>


        {/* ===================================================
            ERRO
        =================================================== */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* ===================================================
            ÁREA DE CHAT
        =================================================== */}

        <section
          className="dashboard-section"
          style={{
            padding: 0,
            overflow: "hidden"
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "280px 1fr",
              minHeight: "600px"
            }}
          >


            {/* =================================================
                LISTA DE CONVERSAS
            ================================================= */}

            <div
              style={{
                borderRight:
                  "1px solid #e5e7eb",
                background:
                  "#f8fafc"
              }}
            >

              <div
                style={{
                  padding: "20px",
                  borderBottom:
                    "1px solid #e5e7eb"
                }}
              >

                <strong>
                  Conversas
                </strong>

              </div>


              {loading ? (

                <div
                  style={{
                    padding: "20px"
                  }}
                >
                  Carregando...
                </div>

              ) : conversations.length === 0 ? (

                <div
                  style={{
                    padding: "20px"
                  }}
                >

                  <p>
                    Você ainda não possui conversas.
                  </p>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b"
                    }}
                  >
                    Quando um cliente enviar uma
                    mensagem, a conversa aparecerá aqui.
                  </p>

                </div>

              ) : (

                conversations.map(
                  (conversation) => (

                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        setSelectedConversation(
                          conversation
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "18px",
                        border: "none",
                        borderBottom:
                          "1px solid #e5e7eb",
                        background:
                          selectedConversation?.id ===
                          conversation.id
                            ? "#ffffff"
                            : "transparent",
                        textAlign: "left",
                        cursor: "pointer"
                      }}
                    >

                      <strong>
                        👤{" "}
                        {conversation.client_name ||
                          "Cliente"}
                      </strong>


                      <p
                        style={{
                          margin:
                            "6px 0 0",
                          fontSize: "13px",
                          color: "#64748b"
                        }}
                      >
                        Cliente
                      </p>


                      <p
                        style={{
                          margin:
                            "4px 0 0",
                          fontSize: "12px",
                          color: "#94a3b8"
                        }}
                      >
                        Conversa #
                        {conversation.id}
                      </p>

                    </button>

                  )
                )

              )}

            </div>


            {/* =================================================
                ÁREA DAS MENSAGENS
            ================================================= */}

            <div
              style={{
                display: "flex",
                flexDirection: "column"
              }}
            >


              {/* =================================================
                  NENHUMA CONVERSA SELECIONADA
              ================================================= */}

              {!selectedConversation ? (

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px"
                  }}
                >

                  <div
                    style={{
                      textAlign: "center"
                    }}
                  >

                    <div
                      style={{
                        fontSize: "48px"
                      }}
                    >
                      💬
                    </div>

                    <h2>
                      Selecione uma conversa
                    </h2>

                    <p>
                      Escolha um cliente para
                      começar a conversar.
                    </p>

                  </div>

                </div>

              ) : (

                <>


                  {/* ===========================================
                      CABEÇALHO DA CONVERSA
                  =========================================== */}

                  <div
                    style={{
                      padding: "20px",
                      borderBottom:
                        "1px solid #e5e7eb"
                    }}
                  >

                    <h2
                      style={{
                        margin: 0
                      }}
                    >
                      💬{" "}
                      {selectedConversation.client_name ||
                        "Cliente"}
                    </h2>


                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        color: "#64748b"
                      }}
                    >
                      Conversa com o cliente
                    </p>

                  </div>


                  {/* ===========================================
                      MENSAGENS
                  =========================================== */}

                  <div
                    style={{
                      flex: 1,
                      padding: "20px",
                      overflowY: "auto",
                      minHeight: "400px",
                      maxHeight: "450px",
                      background:
                        "#f8fafc"
                    }}
                  >

                    {messagesLoading &&
                    messages.length === 0 ? (

                      <p>
                        Carregando mensagens...
                      </p>

                    ) : messages.length === 0 ? (

                      <div
                        style={{
                          textAlign: "center",
                          padding:
                            "50px 20px"
                        }}
                      >

                        <div
                          style={{
                            fontSize: "40px"
                          }}
                        >
                          👋
                        </div>

                        <h3>
                          Comece a conversa
                        </h3>

                        <p>
                          Responda ao cliente
                          para iniciar a conversa.
                        </p>

                      </div>

                    ) : (

                      messages.map(
                        (item) => {

                          const isMine =
                            Number(item.sender_id) ===
                            Number(currentUserId);


                          return (

                            <div
                              key={item.id}
                              style={{
                                display: "flex",
                                justifyContent:
                                  isMine
                                    ? "flex-end"
                                    : "flex-start",
                                marginBottom:
                                  "12px"
                              }}
                            >

                              <div
                                style={{
                                  maxWidth: "70%",
                                  padding:
                                    "12px 16px",
                                  borderRadius:
                                    "12px",
                                  background:
                                    isMine
                                      ? "#2563eb"
                                      : "#e5e7eb",
                                  color:
                                    isMine
                                      ? "#ffffff"
                                      : "#111827",
                                  boxShadow:
                                    "0 1px 3px rgba(0,0,0,0.08)"
                                }}
                              >

                                <p
                                  style={{
                                    margin: 0,
                                    whiteSpace:
                                      "pre-wrap",
                                    wordBreak:
                                      "break-word"
                                  }}
                                >
                                  {item.content}
                                </p>


                                <small
                                  style={{
                                    display:
                                      "block",
                                    marginTop:
                                      "6px",
                                    opacity: 0.7
                                  }}
                                >
                                  {new Date(
                                    item.created_at
                                  ).toLocaleTimeString(
                                    "pt-PT",
                                    {
                                      hour:
                                        "2-digit",
                                      minute:
                                        "2-digit"
                                    }
                                  )}
                                </small>

                              </div>

                            </div>

                          );

                        }
                      )

                    )}

                  </div>


                  {/* ===========================================
                      FORMULÁRIO DE ENVIO
                  =========================================== */}

                  <form
                    onSubmit={
                      handleSendMessage
                    }
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "16px",
                      borderTop:
                        "1px solid #e5e7eb",
                      background:
                        "#ffffff"
                    }}
                  >

                    <input
                      type="text"
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value
                        )
                      }
                      placeholder="Responder ao cliente..."
                      maxLength={2000}
                      disabled={sending}
                      style={{
                        flex: 1
                      }}
                    />


                    <button
                      type="submit"
                      className="register-btn"
                      disabled={
                        sending ||
                        !message.trim()
                      }
                    >
                      {sending
                        ? "Enviando..."
                        : "📨 Enviar"}
                    </button>

                  </form>

                </>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>

  );

}


export default ProviderChat;