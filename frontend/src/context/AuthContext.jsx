import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  async function loadUser() {

    const token =
      localStorage.getItem("access_token");


    if (!token) {

      setUser(null);
      setLoading(false);

      return null;
    }


    try {

      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      if (!response.ok) {

        localStorage.removeItem(
          "access_token"
        );

        setUser(null);

        return null;
      }


      const data = await response.json();

      setUser(data);

      return data;

    } catch (error) {

      console.error(
        "Erro ao carregar usuário:",
        error
      );

      setUser(null);

      return null;

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadUser();

  }, []);


  function logout() {

    localStorage.removeItem(
      "access_token"
    );

    setUser(null);

    window.location.href = "/";

  }


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  return useContext(AuthContext);

}