//kiểm tra trong trong localStorage người dùng đã đăng nhập hay chưa
const useLogin = () => {
  return localStorage.getItem("accessToken") !== null;
};

export default useLogin;
