
import { useEffect } from "react";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute({
  children,
  allowedRoles = []
}) {

  const {
    user,
    loading
  } = useAuth();


  /*
  =========================================================
  REDIRECIONAR USUÁRIO NÃO AUTENTICADO
  =========================================================
  */

  useEffect(() => {

    if (!loading && !user) {

      window.location.href = "/login";

    }

  }, [loading, user]);


  /*
  =========================================================
  VERIFICAR ROLE
  =========================================================
  */

  useEffect(() => {

    if (
      !loading &&
      user &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {

      window.location.href = "/client";

    }

  }, [loading, user, allowedRoles]);


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
            Estamos verificando a sua conta.
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
  ROLE NÃO PERMITIDA
  =========================================================
  */

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {

    return null;

  }


  /*
  =========================================================
  ACESSO AUTORIZADO
  =========================================================
  */

  return children;

}


export default ProtectedRoute;

