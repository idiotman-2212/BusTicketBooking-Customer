import { Container, CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ColorModeContext, useMode } from "./theme"; // Import ColorModeContext và useMode
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
import "./utils/i18n"; // import file cấu hình i18n
import { useEffect } from "react";
import Chat from "./scenes/Chat";

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
  const [theme, colorMode] = useMode(); // Sử dụng hook useMode để lấy theme và colorMode
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  //Tích hợp chatbot
  // useEffect(() => {
  //   (function(d, m) {
  //     var kommunicateSettings = {
  //       "appId": "291034e15da45c3b1f0f79c535bfe8dda", // Thay YOUR_APP_ID bằng App ID của bạn
  //       "popupWidget": true,
  //       "automaticChatOpenOnNavigation": true
  //     };
  //     var s = document.createElement("script");
  //     s.type = "text/javascript";
  //     s.async = true;
  //     s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
  //     var h = document.getElementsByTagName("head")[0];
  //     h.appendChild(s);
  //     window.kommunicate = m;
  //     m._globals = kommunicateSettings;
  //   })(document, window.kommunicate || {});
  // }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
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
                      
                      //Chat với nhân viên
                      <Route path="chat" element={<Chat staffUsername="actualStaffUsername" />} />

                    </Route>
                    <Route path="booking" element={<BookingOrder />} />
                    <Route path="booking-search" element={<BookingSearch />} />
                    <Route path="*" element={<LandingPage />} />
                  </Route>
                </Routes>
              </Container>
            </main>
            <Chat staffUsername="actualStaffUsername" /> {/* Thêm component chat ở đây */}
          </div>
          <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
        </QueryClientProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
