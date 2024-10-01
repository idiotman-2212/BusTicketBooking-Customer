import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import LocalActivityOutlinedIcon from "@mui/icons-material/LocalActivityOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../utils/useLogin";
import UserDrawerItems from "./UserDrawerItems";
import { ColorModeContext, tokens } from "../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { initReactI18next, useTranslation } from "react-i18next";
import vietnamFlag from "../assets/vietnam.png";
import usaFlag from "../assets/uk.png";
import i18n from "../utils/i18n";
import Notification from "../scenes/Notification";

const renderUserSettings = (isLoggedIn) => {
  return (
    <Box width="300px">
      <List sx={{ mt: "20px" }}>
        {UserDrawerItems().map((item, index) =>
          isLoggedIn === item?.requireLogin ? (
            <Link
              key={index}
              to={item.to}
              style={{ textDecoration: "none", color: "#000" }}
            >
              <ListItem disablePadding>
                <ListItemButton disableRipple>
                  <ListItemIcon>{<item.icon />}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </Link>
          ) : !isLoggedIn === !item?.requireLogin ? (
            <Link
              key={index}
              to={item.to}
              style={{ textDecoration: "none", color: "#000" }}
            >
              <ListItem disablePadding>
                <ListItemButton disableRipple>
                  <ListItemIcon>{<item.icon />}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </Link>
          ) : undefined
        )}
      </List>
    </Box>
  );
};

const changeLanguage = (lgn) => {
  i18n.changeLanguage(lgn);
  console.log("change language", lgn);
};

const Topbar = () => {
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const isLoggedIn = useLogin();
  const loggedInUsername = localStorage.getItem("loggedInUsername");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);
  const [language, setLanguage] = useState("vi"); // Ngôn ngữ hiện tại

  // Xử lý thay đổi ngôn ngữ
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    changeLanguage(selectedLanguage);
  };

  return (
    <Box
      zIndex={1000}
      position="fixed"
      top={0}
      left={0}
      right={0}
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p="12px 30px"
      bgcolor={theme.palette.background.default} // Màu nền từ theme
      color={theme.palette.text.primary} // Màu chữ từ theme
    >
      <Box
        sx={{
          cursor: "pointer",
        }}
      >
        {/* ICON */}
        <Link to="/" style={{ textDecoration: "none", color: theme.palette.text.primary }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="4px"
          >
            <Typography fontWeight="bold" variant="h5">
              DATVEXE
            </Typography>
            <Box width="30px" height="30px">
              <img
                src="/bus.png"
                alt="bus_icon"
                width="100%"
                height="100%"
                style={{
                  objectFit: "contain",
                }}
              />
            </Box>
            <Typography fontWeight="bold" variant="h5">
              GIARE
            </Typography>
          </Box>
        </Link>
      </Box>

      {/* Top bar Menu */}
      <Box display="flex" gap="30px" alignItems="center">
        <Link to="/booking">
          <Button
            variant="contained"
            disableRipple
            disableElevation
            color="secondary" // Sử dụng màu từ theme
          >
            <Box display="flex" gap="10px">
              <ConfirmationNumberIcon />
              <Typography variant="h5">{t("Đặt vé")}</Typography>
            </Box>
          </Button>
        </Link>

        <Link to="/booking-search">
          <Button
            variant="contained"
            disableRipple
            disableElevation
            color="secondary" // Sử dụng màu từ theme
          >
            <Box display="flex" gap="10px">
              <SearchIcon />
              <Typography variant="h5">{t("Tra cứu vé")}</Typography>
            </Box>
          </Button>
        </Link>
      </Box>

      {/* User Settings */}
      <Box display="flex" gap="10px" alignItems="center">
        <Button
          disableElevation
          disableRipple
          variant="contained"
          color="secondary" // Sử dụng màu từ theme
          onClick={() => {
            navigate("/my-ticket");
          }}
          startIcon={<LocalActivityOutlinedIcon />}
        >
          {t("Vé của tôi")}
        </Button>
        
        {/* Notification */}
        <Notification />

        {/* side bar user settings */}
        <IconButton onClick={() => setToggleDrawer(!toggleDrawer)}>
        <Box display="flex" alignItems="center" gap="5px" color={theme.palette.text.primary}>
            <ManageAccountsOutlinedIcon />
          </Box>
          <Drawer
            anchor="right"
            open={toggleDrawer}
            onClose={() => setToggleDrawer(!toggleDrawer)}
          >
            {isLoggedIn && loggedInUsername !== null && (
              <>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  height="150px"
                >
                  <Typography fontWeight="bold" variant="h3">
                    {t("Xin chào")}
                  </Typography>
                  <Typography fontStyle="italic" variant="h4">
                    {loggedInUsername}
                  </Typography>
                </Box>
                <Divider />
              </>
            )}

            {renderUserSettings(isLoggedIn)}
          </Drawer>
        </IconButton>

        {/* Color Mode vs Change Language */}
        <Box display="flex">
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "light" ? (
              <LightModeOutlinedIcon />
            ) : (
              <DarkModeOutlinedIcon />
            )}
          </IconButton>

          {/* Select chuyển đổi ngôn ngữ */}
          <Select
            value={language}
            onChange={handleLanguageChange}
            sx={{
              minWidth: "50px", // Giảm chiều rộng xuống tối thiểu
              height: "32px", // Chiều cao của thẻ
              padding: "0 8px", // Giảm padding để tiết kiệm không gian
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center", // Căn giữa cờ trong thẻ
                padding: "0", // Loại bỏ padding để thu nhỏ thẻ nhất có thể
              },
            }}
          >
            <MenuItem value="vi">
              <img
                src={vietnamFlag}
                alt="Tiếng Việt"
                width="24" // Kích thước cờ nhỏ vừa
                height="24"
                style={{ borderRadius: "50%" }}
              />
            </MenuItem>
            <MenuItem value="en">
              <img
                src={usaFlag}
                alt="English"
                width="24" // Kích thước cờ nhỏ vừa
                height="24"
                style={{ borderRadius: "50%" }}
              />
            </MenuItem>
          </Select>
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;
