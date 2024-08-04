import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import PasswordIcon from '@mui/icons-material/Password';
import LockResetIcon from '@mui/icons-material/LockReset';

const UserDrawerItems = [
    {
        label: "Đăng nhập",
        code: "login",
        to: "/login",
        icon: VpnKeyOutlinedIcon,
        requireLogin: false
    },
    {
        label: "Chỉnh sửa thông tin",
        code: "edit_profile",
        to: "/settings",
        icon: SettingsOutlinedIcon,
        requireLogin: true
    },
    {
        label: "Đổi mật khẩu",
        code: "change_password",
        to: "/change-password",
        icon: PasswordIcon,
        requireLogin: true
    },
    {
        label: "Đăng xuất",
        code: "logout",
        to: "/logout",
        icon: LogoutOutlinedIcon,
        requireLogin: true
    },
    {
        label: "Đăng ký",
        code: "register",
        to: "/register",
        icon: LogoutOutlinedIcon,
        requireLogin: false
    },
    {
        label: "Quên mật khẩu",
        code: "forgot",
        to: "/forgot",
        icon: LockResetIcon,
        requireLogin: false
    },

]

export default UserDrawerItems