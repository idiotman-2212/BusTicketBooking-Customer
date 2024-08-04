const useLogin = () => {
  return localStorage.getItem("accessToken") !== null;
};

export default useLogin;
