import { useEffect, useRef, useState } from "react";

import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead
} from "../api/notifications";


function NotificationBell() {

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);


  // =========================================================
  // CARREGAR CONTADOR DE NOTIFICAÇÕES NÃO LIDAS
  // =========================================================

  async function loadUnreadCount() {

    try {

      const data = await getUnreadNotificationsCount();

      /*
        O backend pode retornar:

        { count: 2 }

        ou diretamente:

        2
      */

      if (typeof data === "number") {

        setUnreadCount(data);

      } else {

        setUnreadCount(data?.count || 0);

      }

    } catch (error) {

      console.error(
        "Erro ao carregar contador de notificações:",
        error
      );

    }

  }


  // =========================================================
  // CARREGAR NOTIFICAÇÕES
  // =========================================================

  async function loadNotifications() {

    try {

      const data = await getNotifications();

      /*
        Garantimos que notifications seja sempre um array.
      */

      setNotifications(
        Array.isArray(data)
          ? data
          : data?.notifications || []
      );

    } catch (error) {

      console.error(
        "Erro ao carregar notificações:",
        error
      );

    }

  }


  // =========================================================
  // CARREGAMENTO INICIAL
  // =========================================================

  useEffect(() => {

    loadUnreadCount();

    const interval = setInterval(() => {

      loadUnreadCount();

    }, 3000);

    return () => clearInterval(interval);

  }, []);


  // =========================================================
  // CARREGAR NOTIFICAÇÕES QUANDO ABRIR O DROPDOWN
  // =========================================================

  useEffect(() => {

    if (isOpen) {

      loadNotifications();

    }

  }, [isOpen]);


  // =========================================================
  // FECHAR AO CLICAR FORA
  // =========================================================

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {

        setIsOpen(false);

      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  // =========================================================
  // CLICAR EM UMA NOTIFICAÇÃO
  // =========================================================

  async function handleNotificationClick(notification) {

    try {

      // -----------------------------------------------------
      // MARCAR COMO LIDA
      // -----------------------------------------------------

      if (!notification.is_read) {

        await markNotificationAsRead(
          notification.id
        );

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: true
                }
              : item
          )
        );

        setUnreadCount((currentCount) =>
          Math.max(currentCount - 1, 0)
        );

      }


      // -----------------------------------------------------
      // NOTIFICAÇÃO DE NOVA MENSAGEM
      // -----------------------------------------------------

      if (
        notification.type === "NEW_MESSAGE" &&
        notification.conversation_id
      ) {

        setIsOpen(false);

        /*
          Detectar automaticamente se estamos no
          dashboard do cliente ou do prestador.
        */

        const currentPath = window.location.pathname;

        let chatPath = "/client/chat";

        if (
          currentPath.startsWith("/provider")
        ) {

          chatPath = "/provider/chat";

        }


        console.log(
          "Abrindo conversa pela notificação:",
          {
            chatPath,
            conversationId:
              notification.conversation_id
          }
        );


        /*
          Abrir diretamente a conversa específica.
        */

        window.location.href =
          `${chatPath}?conversation_id=${notification.conversation_id}`;

      }

    } catch (error) {

      console.error(
        "Erro ao processar notificação:",
        error
      );

    }

  }


  // =========================================================
  // TOGGLE DO DROPDOWN
  // =========================================================

  function toggleNotifications() {

    setIsOpen((current) => !current);

  }


  return (

    <div
      ref={dropdownRef}
      style={{
        position: "relative"
      }}
    >

      {/* =====================================================
          BOTÃO DO SINO
      ===================================================== */}

      <button
        type="button"
        onClick={toggleNotifications}
        aria-label="Notificações"
        style={{
          position: "relative",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "24px",
          padding: "8px"
        }}
      >

        🔔


        {/* ===================================================
            BADGE
        =================================================== */}

        {unreadCount > 0 && (

          <span
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              minWidth: "20px",
              height: "20px",
              padding: "0 5px",
              borderRadius: "999px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
              boxSizing: "border-box"
            }}
          >

            {unreadCount > 99
              ? "99+"
              : unreadCount}

          </span>

        )}

      </button>


      {/* =====================================================
          DROPDOWN
      ===================================================== */}

      {isOpen && (

        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: "0",
            width: "360px",
            maxWidth: "calc(100vw - 30px)",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow:
              "0 10px 30px rgba(0, 0, 0, 0.12)",
            zIndex: 9999,
            overflow: "hidden"
          }}
        >

          {/* =================================================
              CABEÇALHO
          ================================================= */}

          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >

            <strong
              style={{
                fontSize: "16px"
              }}
            >
              Notificações
            </strong>

            {unreadCount > 0 && (

              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b"
                }}
              >
                {unreadCount} não lida
                {unreadCount !== 1 ? "s" : ""}
              </span>

            )}

          </div>


          {/* =================================================
              LISTA DE NOTIFICAÇÕES
          ================================================= */}

          {notifications.length === 0 ? (

            <div
              style={{
                padding: "35px 20px",
                textAlign: "center",
                color: "#64748b"
              }}
            >

              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "10px"
                }}
              >
                🔕
              </div>

              <p
                style={{
                  margin: 0
                }}
              >
                Não há notificações.
              </p>

            </div>

          ) : (

            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto"
              }}
            >

              {notifications
                .slice(0, 5)
                .map((notification) => (

                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom:
                        "1px solid #f1f5f9",
                      background:
                        notification.is_read
                          ? "#ffffff"
                          : "#eff6ff",
                      padding: "15px 18px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition:
                        "background 0.2s"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start"
                      }}
                    >

                      {/* ÍCONE */}

                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          minWidth: "38px",
                          borderRadius: "50%",
                          background:
                            notification.type ===
                            "NEW_MESSAGE"
                              ? "#dbeafe"
                              : "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px"
                        }}
                      >

                        {notification.type ===
                        "NEW_MESSAGE"
                          ? "💬"
                          : "🔔"}

                      </div>


                      {/* CONTEÚDO */}

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "8px"
                          }}
                        >

                          <strong
                            style={{
                              fontSize: "14px",
                              color: "#111827"
                            }}
                          >
                            {notification.title ||
                              "Notificação"}
                          </strong>


                          {!notification.is_read && (

                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                minWidth: "8px",
                                borderRadius: "50%",
                                background:
                                  "#2563eb",
                                marginTop: "5px"
                              }}
                            />

                          )}

                        </div>


                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            fontSize: "13px",
                            lineHeight: "1.4",
                            color: "#64748b"
                          }}
                        >
                          {notification.message}
                        </p>


                        {notification.type ===
                          "NEW_MESSAGE" && (

                          <p
                            style={{
                              margin:
                                "7px 0 0",
                              fontSize: "12px",
                              color: "#2563eb",
                              fontWeight: "600"
                            }}
                          >
                            💬 Abrir conversa
                          </p>

                        )}

                      </div>

                    </div>

                  </button>

                ))}

            </div>

          )}

        </div>

      )}

    </div>

  );

}


export default NotificationBell;