import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import PasswordIcon from '@mui/icons-material/Password';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useTranslation } from "react-i18next";

const UserDrawerItems =()=> {
    const {t} = useTranslation();
    return[
    {
        label: t("Đăng nhập"),
        code: "login",
        to: "/login",
        icon: VpnKeyOutlinedIcon,
        requireLogin: false
    },
    {
        label: t("Chỉnh sửa thông tin"),
        code: "edit_profile",
        to: "/settings",
        icon: SettingsOutlinedIcon,
        requireLogin: true
    },
    {
        label: t("Đổi mật khẩu"),
        code: "change_password",
        to: "/change-password",
        icon: PasswordIcon,
        requireLogin: true
    },
    {
        label: t("Đăng xuất"),
        code: "logout",
        to: "/logout",
        icon: LogoutOutlinedIcon,
        requireLogin: true
    },
    {
        label: t("Đăng ký"),
        code: "register",
        to: "/register",
        icon: LogoutOutlinedIcon,
        requireLogin: false
    },
    {
        label: t("Quên mật khẩu"),
        code: "forgot",
        to: "/forgot",
        icon: LockResetIcon,
        requireLogin: false
    },
]

}

export default UserDrawerItems