import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
markConversationNotificationsAsRead,
} from "../api/notifications";

import {
getMyConversations,
getConversationMessages,
sendMessage,
} from "../api/chat";

import ClientLayout from "../components/ClientLayout";

import "./ClientChat.css";

function ClientChat() {
const { user } = useAuth();

const [conversations, setConversations] = useState([]);
const [selectedConversation, setSelectedConversation] = useState(null);
const [messages, setMessages] = useState([]);

const [message, setMessage] = useState("");

const [loading, setLoading] = useState(true);
const [messagesLoading, setMessagesLoading] = useState(false);
const [sending, setSending] = useState(false);

const [error, setError] = useState("");

// Controla a visualização no telemóvel
const [mobileChatOpen, setMobileChatOpen] = useState(false);

// =========================================================
// OBTER ID DO UTILIZADOR LOGADO
// =========================================================

const getCurrentUserId = () => {
try {
const token = localStorage.getItem("access_token");


  if (!token) {
    return null;
  }

  const payloadBase64 = token
    .split(".")[1]
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const payload = JSON.parse(atob(payloadBase64));

  return Number(payload.sub);
} catch (error) {
  console.error("Erro ao obter utilizador do token:", error);
  return null;
}


};

// =========================================================
// OBTER CONVERSATION_ID DA URL
// =========================================================

const getConversationIdFromUrl = () => {
const params = new URLSearchParams(window.location.search);


const id = params.get("conversation_id");

return id ? Number(id) : null;


};

// =========================================================
// CARREGAR CONVERSAS
// =========================================================

const loadConversations = async () => {
try {
setError("");


  const data = await getMyConversations();

  const conversationList = Array.isArray(data)
    ? data
    : data?.conversations || [];

  setConversations(conversationList);

  if (conversationList.length === 0) {
    setSelectedConversation(null);
    return;
  }

  const urlConversationId = getConversationIdFromUrl();

  let conversationToSelect = null;

  if (urlConversationId) {
    conversationToSelect = conversationList.find(
      (conversation) =>
        Number(conversation.id) === Number(urlConversationId)
    );
  }

  if (!conversationToSelect) {
    conversationToSelect = conversationList[0];
  }

  setSelectedConversation((current) => {
    if (
      current &&
      conversationList.some(
        (conversation) =>
          Number(conversation.id) === Number(current.id)
      )
    ) {
      return current;
    }

    return conversationToSelect;
  });
} catch (err) {
  console.error("Erro ao carregar conversas:", err);

  setError(
    err?.response?.data?.detail ||
    err?.message ||
    "Não foi possível carregar as conversas."
  );
} finally {
  setLoading(false);
}


};

// =========================================================
// CARREGAR MENSAGENS
// =========================================================

const loadMessages = async (conversationId, silent = false) => {
if (!conversationId) {
return;
}


try {
  if (!silent) {
    setMessagesLoading(true);
  }

  const data = await getConversationMessages(conversationId);

  const messageList = Array.isArray(data)
    ? data
    : data?.messages || [];

  setMessages(messageList);
} catch (err) {
  console.error("Erro ao carregar mensagens:", err);

  if (!silent) {
    setError(
      err?.response?.data?.detail ||
      err?.message ||
      "Não foi possível carregar as mensagens."
    );
  }
} finally {
  if (!silent) {
    setMessagesLoading(false);
  }
}


};

// =========================================================
// PRIMEIRO CARREGAMENTO
// =========================================================

useEffect(() => {
loadConversations();
}, []);

// =========================================================
// QUANDO MUDA A CONVERSA
// =========================================================

useEffect(() => {
if (!selectedConversation?.id) {
setMessages([]);
return;
}


loadMessages(selectedConversation.id);

setMobileChatOpen(true);

const markNotifications = async () => {
  try {
    await markConversationNotificationsAsRead(
      selectedConversation.id
    );
  } catch (error) {
    console.error(
      "Erro ao marcar notificações como lidas:",
      error
    );
  }
};

markNotifications();


}, [selectedConversation?.id]);

// =========================================================
// ATUALIZAÇÃO AUTOMÁTICA DAS MENSAGENS
// =========================================================

useEffect(() => {
if (!selectedConversation?.id) {
return;
}


const interval = setInterval(() => {
  loadMessages(selectedConversation.id, true);
}, 3000);

return () => clearInterval(interval);


}, [selectedConversation?.id]);

// =========================================================
// ENVIAR MENSAGEM
// =========================================================

const handleSendMessage = async (event) => {
event.preventDefault();


const text = message.trim();

if (!text || !selectedConversation?.id || sending) {
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
    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);
  } else {
    await loadMessages(selectedConversation.id, true);
  }

  try {
    await loadConversations();
  } catch (error) {
    console.error(
      "Erro ao atualizar conversas:",
      error
    );
  }
} catch (err) {
  console.error("Erro ao enviar mensagem:", err);

  setError(
    err?.response?.data?.detail ||
    err?.message ||
    "Não foi possível enviar a mensagem."
  );
} finally {
  setSending(false);
}


};

// =========================================================
// SELECIONAR CONVERSA
// =========================================================

const handleSelectConversation = (conversation) => {
setSelectedConversation(conversation);
setError("");


const url = new URL(window.location.href);

url.searchParams.set(
  "conversation_id",
  conversation.id
);

window.history.replaceState({}, "", url);

setMobileChatOpen(true);


};

// =========================================================
// VOLTAR PARA LISTA DE CONVERSAS NO MOBILE
// =========================================================

const handleBackToConversations = () => {
setMobileChatOpen(false);
};

// =========================================================
// FORMATAÇÃO DE DATA/HORA
// =========================================================

const formatMessageTime = (dateValue) => {
if (!dateValue) {
return "";
}


try {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("pt-MZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
} catch {
  return "";
}


};

// =========================================================
// NOME DA CONVERSA
// =========================================================

const getConversationName = (conversation) => {
if (!conversation) {
return "Conversa";
}


return (
  conversation.other_user_name ||
  conversation.provider_name ||
  conversation.user_name ||
  conversation.name ||
  conversation.other_user?.name ||
  "Prestador"
);


};

// =========================================================
// ÚLTIMA MENSAGEM
// =========================================================

const getLastMessage = (conversation) => {
if (!conversation) {
return "";
}


return (
  conversation.last_message?.content ||
  conversation.last_message?.message ||
  conversation.last_message_content ||
  conversation.last_message ||
  "Nenhuma mensagem ainda"
);


};

// =========================================================
// ID DO REMETENTE
// =========================================================

const getSenderId = (msg) => {
return Number(
msg?.sender_id ??
msg?.user_id ??
msg?.sender?.id
);
};

// =========================================================
// CONTEÚDO DA MENSAGEM
// =========================================================

const getMessageContent = (msg) => {
return (
msg?.content ||
msg?.message ||
msg?.text ||
""
);
};

// =========================================================
// LOADING INICIAL
// =========================================================

if (loading) {
return ( <ClientLayout
     activePage="chat"
     title="Mensagens"
     subtitle="Converse diretamente com os prestadores dos seus serviços."
     label="ÁREA DO CLIENTE"
   > <div className="client-chat-loading-screen"> <div className="client-chat-spinner"></div> <p>A carregar conversas...</p> </div> </ClientLayout>
);
}

// =========================================================
// RENDER
// =========================================================

const currentUserId = getCurrentUserId();

return ( <ClientLayout
   activePage="chat"
   title="Mensagens"
   subtitle="Converse diretamente com os prestadores dos seus serviços."
   label="ÁREA DO CLIENTE"
 >


  <div className="client-chat-content">

    {/* ===================================================
        ERRO
    ==================================================== */}

    {error && (
      <div className="client-chat-error">
        <span>⚠️</span>
        <span>{error}</span>

        <button
          type="button"
          onClick={() => setError("")}
        >
          ×
        </button>
      </div>
    )}


    {/* ===================================================
        CHAT
    ==================================================== */}

    <section className="client-chat-section">

      <div
        className={`client-chat-layout ${
          mobileChatOpen
            ? "client-chat-mobile-open"
            : ""
        }`}
      >

        {/* ===============================================
            LISTA DE CONVERSAS
        ================================================ */}

        <div className="client-chat-conversations">

          <div className="client-chat-conversations-header">

            <div>
              <h2>Conversas</h2>

              <span>
                {conversations.length}{" "}
                {conversations.length === 1
                  ? "conversa"
                  : "conversas"}
              </span>
            </div>

          </div>


          <div className="client-chat-conversation-list">

            {conversations.length === 0 ? (

              <div className="client-chat-empty-list">

                <div className="client-chat-empty-icon">
                  💬
                </div>

                <h3>Nenhuma conversa</h3>

                <p>
                  Quando começar uma conversa com um
                  prestador, ela aparecerá aqui.
                </p>

                <a href="/services">
                  Procurar um serviço
                </a>

              </div>

            ) : (

              conversations.map((conversation) => {

                const isActive =
                  selectedConversation?.id ===
                  conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`client-chat-conversation-item ${
                      isActive
                        ? "client-chat-conversation-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectConversation(
                        conversation
                      )
                    }
                  >

                    <div className="client-chat-conversation-avatar">
                      {getConversationName(
                        conversation
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>


                    <div className="client-chat-conversation-content">

                      <div className="client-chat-conversation-top">

                        <strong>
                          {getConversationName(
                            conversation
                          )}
                        </strong>

                        {conversation.last_message_at && (
                          <span>
                            {formatMessageTime(
                              conversation.last_message_at
                            )}
                          </span>
                        )}

                      </div>


                      <p>
                        {getLastMessage(conversation)}
                      </p>

                    </div>

                  </button>
                );
              })

            )}

          </div>

        </div>


        {/* ===============================================
            JANELA DA CONVERSA
        ================================================ */}

        <div className="client-chat-window">

          {selectedConversation ? (

            <>

              {/* HEADER DA CONVERSA */}

              <div className="client-chat-window-header">

                <button
                  type="button"
                  className="client-chat-back-button"
                  onClick={handleBackToConversations}
                >
                  ←
                  <span>Conversas</span>
                </button>


                <div className="client-chat-contact">

                  <div className="client-chat-contact-avatar">
                    {getConversationName(
                      selectedConversation
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2>
                      {getConversationName(
                        selectedConversation
                      )}
                    </h2>

                    <span>
                      Prestador
                    </span>
                  </div>

                </div>

              </div>


              {/* MENSAGENS */}

              <div className="client-chat-messages">

                {messagesLoading ? (

                  <div className="client-chat-messages-loading">
                    <div className="client-chat-spinner"></div>
                    <span>
                      A carregar mensagens...
                    </span>
                  </div>

                ) : messages.length === 0 ? (

                  <div className="client-chat-no-messages">

                    <div className="client-chat-no-messages-icon">
                      👋
                    </div>

                    <h3>
                      Comece a conversa
                    </h3>

                    <p>
                      Envie uma mensagem para
                      começar a conversar com este
                      prestador.
                    </p>

                  </div>

                ) : (

                  messages.map((msg, index) => {

                    const senderId =
                      getSenderId(msg);

                    const isMine =
                      currentUserId !== null &&
                      senderId === currentUserId;

                    return (
                      <div
                        key={
                          msg.id ||
                          msg._id ||
                          `message-${index}`
                        }
                        className={`client-chat-message-row ${
                          isMine
                            ? "client-chat-message-mine"
                            : "client-chat-message-theirs"
                        }`}
                      >

                        <div className="client-chat-message-bubble">

                          <div className="client-chat-message-text">
                            {getMessageContent(msg)}
                          </div>

                          <span className="client-chat-message-time">
                            {formatMessageTime(
                              msg.created_at ||
                              msg.createdAt ||
                              msg.timestamp
                            )}
                          </span>

                        </div>

                      </div>
                    );

                  })

                )}

              </div>


              {/* FORMULÁRIO */}

              <form
                className="client-chat-form"
                onSubmit={handleSendMessage}
              >

                <input
                  type="text"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Escreva uma mensagem..."
                  maxLength={2000}
                  disabled={sending}
                  autoComplete="off"
                />


                <button
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                >
                  {sending
                    ? "..."
                    : "Enviar"}
                </button>

              </form>

            </>

          ) : (

            <div className="client-chat-no-selection">

              <div className="client-chat-no-selection-icon">
                💬
              </div>

              <h2>
                Selecione uma conversa
              </h2>

              <p>
                Escolha uma conversa na lista para
                começar a trocar mensagens.
              </p>

            </div>

          )}

        </div>

      </div>

    </section>

  </div>

</ClientLayout>


);
}

export default ClientChat;
