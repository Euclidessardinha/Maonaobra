
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
        }

        setUser(null);
        return null;
      }

      const data = await response.json();
      setUser(data);

      return data;

    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
      return null;

    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // ESCOLHER ÁREA DO ONBOARDING
  // =====================================================

  async function selectOnboardingArea(area) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Sessão não encontrada. Faça login novamente.");
    }

    const response = await fetch(
      `${API_URL}/auth/onboarding/select`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ area })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Não foi possível selecionar a área.");
    }

    await loadUser();

    return data;
  }

  // =====================================================
  // CONCLUIR ONBOARDING
  // =====================================================

  async function completeOnboarding(area) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Sessão não encontrada. Faça login novamente.");
    }

    const response = await fetch(
      `${API_URL}/auth/onboarding/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ area })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Não foi possível concluir o onboarding.");
    }

    await loadUser();

    return data;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
    window.location.href = "/";
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        loadUser,
        selectOnboardingArea,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
