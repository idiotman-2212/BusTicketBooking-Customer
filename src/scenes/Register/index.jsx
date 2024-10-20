import React, { useState, useContext } from "react";
import * as yup from "yup";
import { messages } from "../../utils/validationMessages";
import * as authApi from "../../queries/auth/authQueries";
import { debounce } from "../../utils/debounce";
import { APP_CONSTANTS } from "../../utils/appContants";
import { Formik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { tokens, ColorModeContext } from "../../theme";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  Button,
  useTheme
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { handleToast } from "../../utils/helpers";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const initialValues = {
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  rePassword: "",
  email: "",
  phone: "",
  role: "ROLE_CUSTOMER",
};

const checkExistUsernameDebounced = debounce(authApi.checkExistUsername, 500);
const checkExistEmailDebounced = debounce(authApi.checkExistEmail, 500);
const checkExistPhoneDebounced = debounce(authApi.checkExistPhone, 500);

const registerSchema = yup.object().shape({
  firstName: yup.string().required(messages.common.required),
  lastName: yup.string().required(messages.common.required),
  username: yup
    .string()
    .required(messages.common.required)
    .test("username", "Tài khoản đã tồn tại", async (value) => {
      const isAvailable = await checkExistUsernameDebounced(value);
      return !isAvailable;
    }),
  password: yup.string().required(messages.common.required),
  rePassword: yup
    .string()
    .required(messages.common.required)
    .test("password", "Mật khẩu không khớp", (value, ctx) => {
      return value === ctx.parent.password;
    }),
  email: yup
    .string()
    .required(messages.common.required)
    .matches(APP_CONSTANTS.EMAIL_REGEX, messages.email.invalid)
    .test("email", "Địa chỉ email đã được sử dụng", async (value) => {
      const isAvailable = await checkExistEmailDebounced(value);
      return !isAvailable;
    }),
  phone: yup
    .string()
    .required(messages.common.required)
    .matches(APP_CONSTANTS.PHONE_REGEX, messages.phone.invalid)
    .test("phone", "Số điện thoại đã được sử dụng", async (value) => {
      const isAvailable = await checkExistPhoneDebounced(value);
      return !isAvailable;
    }),
  role: yup.string().notRequired(),
});

const Register = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();

  // create register mutation
  const registerMutation = useMutation({
    mutationFn: (registerReq) => authApi.register(registerReq),
  });

  const handleFormSubmit = (values, actions) => {
    const { rePassword, ...newValues } = values;
    console.log(newValues);

    registerMutation.mutate(newValues, {
      onSuccess: (data) => {
        console.log(data.token);
        handleToast("success", t("Đăng ký tài khoản thành công"));

        navigate("/login");
      },
      onError: (error) => {
        console.log(error);
        handleToast("error", error.response?.data?.message);
      },
    });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="600px"
    >
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={registerSchema}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              width="400px"
              p="20px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              bgcolor={colors.primary[400]}
              borderRadius="8px"
            >
              <Box gridColumn="span 4" textAlign="center" m="20px 0">
                <Typography variant="h2" fontWeight="bold">
                  {t("Đăng ký")}
                </Typography>
              </Box>

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Họ *")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Tên *")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Địa chỉ email *")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{
                  gridColumn: "span 2",
                }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Số điện thoại *")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={!!touched.phone && !!errors.phone}
                helperText={touched.phone && errors.phone}
                sx={{
                  gridColumn: "span 2",
                }}
              />

              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Tài khoản *")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <FormControl
                color="warning"
                sx={{ gridColumn: "span 4" }}
                variant="outlined"
                size="small"
              >
                <InputLabel
                  error={!!touched.password && !!errors.password}
                  htmlFor="outlined-adornment-password"
                >
                  {t("Mật khẩu *")}
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPwd ? "text" : "password"}
                  label={t("Mật khẩu *")}
                  fullWidth
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  name="password"
                  error={!!touched.password && !!errors.password}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPwd(!showPwd)}
                        edge="end"
                      >
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {!!touched.password && !!errors.password && (
                  <FormHelperText error>{errors.password}</FormHelperText>
                )}
              </FormControl>
              <FormControl
                color="warning"
                sx={{ gridColumn: "span 4" }}
                variant="outlined"
                size="small"
              >
                <InputLabel
                  error={!!touched.rePassword && !!errors.rePassword}
                  htmlFor="outlined-adornment-rePassword"
                >
                  {t("Nhập lại mật khẩu *")}
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-rePassword"
                  type={showPwd ? "text" : "password"}
                  label={t("Mật khẩu *")}
                  fullWidth
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.rePassword}
                  name="rePassword"
                  error={!!touched.rePassword && !!errors.rePassword}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPwd(!showPwd)}
                        edge="end"
                      >
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {!!touched.rePassword && !!errors.rePassword && (
                  <FormHelperText error>{errors.rePassword}</FormHelperText>
                )}
              </FormControl>

              <Box gridColumn="span 4" textAlign="center" m="10px">
                <Button
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="success"
                  type="submit"
                >
                  {t("Đăng ký")}
                </Button>
              </Box>

              <Box
                mb="10px"
                display="flex"
                gridColumn="span 4"
                justifyContent="center"
                textAlign="center"
                flexDirection="column"
                gap="10px"
              >
                <Box>
                  <Typography component="span" variant="h5">
                    {t("Đã có tài khoản ?")}
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <Typography component="span" variant="h5">
                        {" "}
                        {t("Đăng nhập")}
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
                <Box>
                  <Typography component="span" variant="h5">
                    {t("Quên mật khẩu ?")}
                    <Link to="/forgot" style={{ textDecoration: "none" }}>
                      <Typography component="span" variant="h5">
                        {" "}
                        {t("Khôi phục")}
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Register;
