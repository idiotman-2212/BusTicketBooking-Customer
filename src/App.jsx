import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { themeSettings } from "../../ticket-booking-admin/src/theme";
import { themeSettings } from "./theme";

import Topbar from "./global/Topbar";
import BookingOrder from "./scenes/BookingOrder";
import BookingSearch from "./scenes/BookingSearch";
import LandingPage from "./scenes/LandingPage";
import Login from "./scenes/Login";
import Logout from "./scenes/Logout";
import Register from "./scenes/Register";
import useLogin from "./utils/useLogin";
import UserSettings from "./scenes/UserSettings";
import ForgotPwd from "./scenes/ForgotPwd";
import ChangePassword from "./scenes/ChangePassword";
import MyTicket from "./scenes/MyTicket";

const ProtectedRoutes = () => {
  const isLoggedIn = useLogin();
  const location = useLocation();
  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
};

const App = () => {
  const theme = createTheme(themeSettings());
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="bottom-right" />
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <Topbar />
          <main className="content">
            <Container maxWidth="lg">
              <Routes>
                <Route path="/">
                  <Route index element={<LandingPage />} />
                  <Route path="login" element={<Login />} />
                  <Route path="logout" element={<Logout />} />
                  <Route path="forgot" element={<ForgotPwd />} />
                  <Route path="register" element={<Register />} />
                  <Route element={<ProtectedRoutes />}>
                    <Route path="settings" element={<UserSettings />} />
                    <Route path="my-ticket" element={<MyTicket />} />
                    <Route
                      path="change-password"
                      element={<ChangePassword />}
                    />
                  </Route>
                  <Route path="booking" element={<BookingOrder />} />
                  <Route path="booking-search" element={<BookingSearch />} />
                  <Route path="*" element={<LandingPage />} />
                </Route>
              </Routes>
            </Container>
          </main>
        </div>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
