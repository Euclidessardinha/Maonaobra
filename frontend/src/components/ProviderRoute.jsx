
import { useEffect } from "react";

import { useAuth } from "../context/AuthContext";


function ProviderRoute({ children }) {

  const {
    user,
    loading
  } = useAuth();


  /*
  =========================================================
  USUÁRIO NÃO AUTENTICADO
  =========================================================
  */

  useEffect(() => {

    if (!loading && !user) {

      window.location.href = "/login";

    }

  }, [loading, user]);


  /*
  =========================================================
  USUÁRIO SEM PERFIL PROFISSIONAL
  =========================================================
  */

  useEffect(() => {

    if (
      !loading &&
      user &&
      !user.is_provider
    ) {

      window.location.href = "/client";

    }

  }, [loading, user]);


  /*
  =========================================================
  CARREGAMENTO
  =========================================================
  */

  if (loading) {

    return (
      <div className="auth-page">

        <div className="auth-card">

          <h2>
            Carregando...
          </h2>

          <p>
            Estamos verificando o seu perfil profissional.
          </p>

        </div>

      </div>
    );

  }


  /*
  =========================================================
  SEM USUÁRIO
  =========================================================
  */

  if (!user) {

    return null;

  }


  /*
  =========================================================
  SEM PERFIL PROFISSIONAL
  =========================================================
  */

  if (!user.is_provider) {

    return null;

  }


  /*
  =========================================================
  ACESSO AUTORIZADO
  =========================================================
  */

  return children;

}


export default ProviderRoute;

