import { useEffect, useState } from "react";

import {
  getNotifications,
  markNotificationAsRead
} from "../api/notifications";


function ClientNotifications() {

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  async function loadNotifications() {

    try {

      setError("");

      const data = await getNotifications();

      setNotifications(data);

    } catch (error) {

      console.error(
        "Erro ao carregar notificações:",
        error
      );

      setError(
        error.message ||
        "Erro ao carregar notificações."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadNotifications();

  }, []);


  async function handleMarkAsRead(notificationId) {

    try {

      await markNotificationAsRead(
        notificationId
      );


      setNotifications(
        currentNotifications =>
          currentNotifications.map(
            notification =>
              notification.id === notificationId
                ? {
                    ...notification,
                    is_read: true
                  }
                : notification
          )
      );

    } catch (error) {

      console.error(
        "Erro ao marcar notificação:",
        error
      );

    }

  }


  async function handleMarkAllAsRead() {

    const unread =
      notifications.filter(
        notification =>
          !notification.is_read
      );


    try {

      await Promise.all(
        unread.map(
          notification =>
            markNotificationAsRead(
              notification.id
            )
        )
      );


      setNotifications(
        currentNotifications =>
          currentNotifications.map(
            notification => ({
              ...notification,
              is_read: true
            })
          )
      );

    } catch (error) {

      console.error(
        "Erro ao marcar notificações:",
        error
      );

    }

  }


  function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleString(
      "pt-PT",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  const unreadCount =
    notifications.filter(
      notification =>
        !notification.is_read
    ).length;


  return (

    <div className="dashboard">


      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          Mão<span>NaObra</span>
        </div>


        <nav>

          <a href="/client">
            🏠 Visão geral
          </a>

          <a href="/client/requests">
            📋 Meus pedidos
          </a>

          <a href="/client/favorites">
            ❤️ Favoritos
          </a>

          <a href="/client/reviews">
            ⭐ Avaliações
          </a>

          <a href="/client/notifications">
            🔔 Notificações
          </a>

          <a href="/client/profile">
            👤 Meu perfil
          </a>

        </nav>


        <button
          onClick={() =>
            window.location.href = "/login"
          }
          className="sidebar-logout"
        >
          Sair
        </button>

      </aside>



      {/* CONTEÚDO */}

      <main className="dashboard-content">


        <div className="dashboard-header">

          <div>

            <span className="section-label">
              NOTIFICAÇÕES
            </span>

            <h1>
              Suas notificações 🔔
            </h1>

            <p>
              Veja as novidades e mensagens
              recebidas na plataforma.
            </p>

          </div>


          {unreadCount > 0 && (

            <button
              className="register-btn"
              onClick={handleMarkAllAsRead}
            >
              ✓ Marcar todas como lidas
            </button>

          )}

        </div>



        {error && (

          <div className="error-message">
            {error}
          </div>

        )}



        {loading ? (

          <div className="empty-state">

            <h3>
              Carregando notificações...
            </h3>

          </div>

        ) : notifications.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🔔
            </div>

            <h3>
              Nenhuma notificação
            </h3>

            <p>
              Quando houver novidades,
              elas aparecerão aqui.
            </p>

          </div>

        ) : (

          <section className="dashboard-section">

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >

              {notifications.map(
                notification => (

                  <div
                    key={notification.id}

                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      background:
                        notification.is_read
                          ? "#ffffff"
                          : "#eff6ff",
                      boxShadow:
                        notification.is_read
                          ? "none"
                          : "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                  >

                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        minWidth: "45px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          notification.is_read
                            ? "#f3f4f6"
                            : "#dbeafe",
                        fontSize: "21px"
                      }}
                    >
                      {notification.type ===
                      "NEW_MESSAGE"
                        ? "💬"
                        : "🔔"}
                    </div>


                    <div
                      style={{
                        flex: 1
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >

                        <h3
                          style={{
                            margin: 0,
                            fontSize: "16px"
                          }}
                        >
                          {notification.title}
                        </h3>


                        {!notification.is_read && (

                          <span
                            style={{
                              background: "#2563eb",
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: "bold",
                              padding: "3px 7px",
                              borderRadius: "20px"
                            }}
                          >
                            NOVA
                          </span>

                        )}

                      </div>


                      <p
                        style={{
                          margin:
                            "5px 0",
                          color: "#4b5563"
                        }}
                      >
                        {notification.message}
                      </p>


                      <small
                        style={{
                          color: "#9ca3af"
                        }}
                      >
                        {formatDate(
                          notification.created_at
                        )}
                      </small>

                    </div>


                    {!notification.is_read && (

                      <button
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id
                          )
                        }

                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#2563eb",
                          fontWeight: "600"
                        }}
                      >
                        Marcar como lida
                      </button>

                    )}

                  </div>

                )
              )}

            </div>

          </section>

        )}

      </main>

    </div>

  );

}


export default ClientNotifications;