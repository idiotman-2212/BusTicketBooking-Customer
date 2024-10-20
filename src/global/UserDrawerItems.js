import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import PasswordIcon from "@mui/icons-material/Password";
import LockResetIcon from "@mui/icons-material/LockReset";
import StarsIcon from "@mui/icons-material/Stars";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined"; // Icon cho đăng ký
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material";
import { ColorModeContext, tokens } from "../theme";
import React, { useContext } from "react";

const UserDrawerItems = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);

  return [
    {
      label: t("Xu của tôi"),
      code: "my_loyalty",
      to: "/my_loyalty",
      icon: StarsIcon,
      requireLogin: true,
      color: colors.primary[400], // Áp dụng màu sắc cho chế độ tối
    },
    {
      label: t("Chỉnh sửa thông tin"),
      code: "edit_profile",
      to: "/settings",
      icon: SettingsOutlinedIcon,
      requireLogin: true,
      color: colors.primary[400], // Sử dụng màu từ primary cho chế độ tối
    },
    {
      label: t("Đổi mật khẩu"),
      code: "change_password",
      to: "/change-password",
      icon: PasswordIcon,
      requireLogin: true,
      color: colors.primary[400], // Màu sắc của item
    },
    {
      label: t("Đăng xuất"),
      code: "logout",
      to: "/logout",
      icon: LogoutOutlinedIcon,
      requireLogin: true,
      color: colors.primary[400], 
    },
    {
      label: t("Đăng nhập"),
      code: "login",
      to: "/login",
      icon: VpnKeyOutlinedIcon,
      requireLogin: false,
      color: colors.primary[400], // Màu xanh nhấn cho đăng nhập
    },
    {
      label: t("Đăng ký"),
      code: "register",
      to: "/register",
      icon: PersonAddAltOutlinedIcon,
      requireLogin: false,
      color: colors.primary[400], // Màu xanh dương nhạt cho đăng ký
    },
    {
      label: t("Quên mật khẩu"),
      code: "forgot",
      to: "/forgot",
      icon: LockResetIcon,
      requireLogin: false,
      color: colors.primary[400], // Màu xám cho quên mật khẩu
    },
  ];
};

export default UserDrawerItems;
