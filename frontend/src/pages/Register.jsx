import { useState } from "react";

import { registerUser } from "../api/auth";


function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);


    try {

      await registerUser({
        name,
        email,
        phone,
        password
      });


      setSuccess(
        "Conta criada com sucesso! Você será encaminhado para o login."
      );


      setName("");
      setEmail("");
      setPhone("");
      setPassword("");


      setTimeout(() => {

        window.location.href = "/login";

      }, 1500);


    } catch (error) {

      setError(
        error?.message ||
        "Não foi possível criar a conta."
      );

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="auth-page">

      <div className="auth-card">


        {/* =================================================
           LOGOTIPO
        ================================================= */}

        <div className="auth-logo">

          Mão<span>NaObra</span>

        </div>


        <h1>
          Criar conta
        </h1>


        <p>
          Crie a sua conta e comece a usar o MãoNaObra.
        </p>


        {/* =================================================
           MENSAGEM DE ERRO
        ================================================= */}

        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* =================================================
           MENSAGEM DE SUCESSO
        ================================================= */}

        {success && (

          <div className="success-message">

            {success}

          </div>

        )}


        {/* =================================================
           FORMULÁRIO
        ================================================= */}

        <form onSubmit={handleSubmit}>


          {/* NOME */}

          <label>
            Nome
          </label>

          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            disabled={loading}
            required
          />


          {/* EMAIL */}

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
            disabled={loading}
            required
          />


          {/* TELEFONE */}

          <label>
            Telefone
          </label>

          <input
            type="tel"
            placeholder="86xxxxxxx"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            disabled={loading}
            required
          />


          {/* SENHA */}

          <label>
            Senha
          </label>

          <input
            type="password"
            placeholder="Crie uma senha"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={loading}
            minLength={8}
            required
          />


          {/* BOTÃO */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Criando..."
              : "Criar conta"
            }

          </button>


        </form>


        {/* =================================================
           LOGIN
        ================================================= */}

        <p className="auth-footer">

          Já possui uma conta?

          {" "}

          <a href="/login">
            Entrar
          </a>

        </p>


      </div>

    </div>

  );

}


export default Register;