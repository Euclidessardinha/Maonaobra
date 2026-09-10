import { useState } from "react";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";


function Login() {

  const { loadUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setLoading(true);


    try {

      const data = await loginUser(
        email,
        password
      );


      localStorage.setItem(
        "access_token",
        data.access_token
      );


      const loggedUser = await loadUser();


      if (!loggedUser) {

        throw new Error(
          "Não foi possível carregar os dados da sua conta."
        );

      }


      /*
       * ==========================================
       * REDIRECIONAMENTO AUTOMÁTICO
       * ==========================================
       */

      if (loggedUser.role === "CLIENT") {

        window.location.href = "/client";

        return;
      }


      if (loggedUser.role === "PROVIDER") {

        window.location.href = "/provider";

        return;
      }


      /*
       * Caso exista algum tipo de usuário
       * que ainda não tenha uma área definida.
       */

      window.location.href = "/";

    } catch (error) {

      setError(
        error.message ||
        "Não foi possível realizar o login."
      );

    } finally {

      setLoading(false);

    }
  }


  return (

    <div className="auth-page">

      <div className="auth-card">


        <div className="auth-logo">

          Mão<span>NaObra</span>

        </div>


        <h1>
          Bem-vindo de volta
        </h1>


        <p>
          Entre na sua conta para continuar.
        </p>


        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        <form onSubmit={handleSubmit}>


          <label>
            Email
          </label>


          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />


          <label>
            Senha
          </label>


          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Entrando..."
              : "Entrar"
            }

          </button>


        </form>


        <p className="auth-footer">

          Ainda não possui uma conta?

          {" "}

          <a href="/register">
            Criar conta
          </a>

        </p>


      </div>

    </div>

  );
}


export default Login;