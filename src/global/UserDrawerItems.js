import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import PasswordIcon from "@mui/icons-material/Password";
import LockResetIcon from "@mui/icons-material/LockReset";
import StarsIcon from "@mui/icons-material/Stars";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined"; // Icon cho đăng ký
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles"; // Thêm useTheme để quản lý theme
import { tokens } from "../theme"; // Sử dụng tokens để truy cập màu sắc tuỳ vào chế độ sáng/tối

const UserDrawerItems = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Lấy màu sắc dựa trên chế độ sáng/tối

  return [
    {
      label: t("Xu của tôi"),
      code: "my_loyalty",
      to: "/my_loyalty",
      icon: StarsIcon,
      requireLogin: true,
      color: colors.grey[100], // Áp dụng màu sắc cho chế độ tối
    },
    {
      label: t("Chỉnh sửa thông tin"),
      code: "edit_profile",
      to: "/settings",
      icon: SettingsOutlinedIcon,
      requireLogin: true,
      color: colors.primary[500], // Sử dụng màu từ primary cho chế độ tối
    },
    {
      label: t("Đổi mật khẩu"),
      code: "change_password",
      to: "/change-password",
      icon: PasswordIcon,
      requireLogin: true,
      color: colors.grey[200], // Màu sắc của item
    },
    {
      label: t("Đăng xuất"),
      code: "logout",
      to: "/logout",
      icon: LogoutOutlinedIcon,
      requireLogin: true,
      color: colors.greenAccent[500], 
    },
    {
      label: t("Đăng nhập"),
      code: "login",
      to: "/login",
      icon: VpnKeyOutlinedIcon,
      requireLogin: false,
      color: colors.greenAccent[500], // Màu xanh nhấn cho đăng nhập
    },
    {
      label: t("Đăng ký"),
      code: "register",
      to: "/register",
      icon: PersonAddAltOutlinedIcon,
      requireLogin: false,
      color: colors.blueAccent[500], // Màu xanh dương nhạt cho đăng ký
    },
    {
      label: t("Quên mật khẩu"),
      code: "forgot",
      to: "/forgot",
      icon: LockResetIcon,
      requireLogin: false,
      color: colors.grey[300], // Màu xám cho quên mật khẩu
    },
  ];
};

export default UserDrawerItems;
