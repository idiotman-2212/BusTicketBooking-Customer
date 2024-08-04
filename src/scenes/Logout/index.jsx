import React from "react";
import useLogin from "../../utils/useLogin";
import * as authApi from "../../queries/auth/authQueries";
import { Navigate } from "react-router-dom";

const Logout = () => {
  const isLoggedIn = useLogin();

  if (!isLoggedIn) return <Navigate to="/login" />;

  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loggedInUsername");
  };

  handleLogout();

  return <Navigate to="/login" />;
};

export default Logout;
