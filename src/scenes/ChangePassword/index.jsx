import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import * as authApi from "../../queries/auth/authQueries";
import { tokens } from "../../theme";
import { debounce } from "../../utils/debounce";
import { handleToast } from "../../utils/helpers";
import useLogin from "../../utils/useLogin";
import { messages } from "../../utils/validationMessages";
import {
  Box,
  colors,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const initialValues = {
  username: "",
  newPassword: "",
  reNewPassword: "",
};

const changePwdSchema = yup.object().shape({
  newPassword: yup.string().required(messages.common.required),
  reNewPassword: yup
    .string()
    .required(messages.common.required)
    .test("newPassword", "Mật khẩu mới không khớp", (value, ctx) => {
      return value === ctx.parent.newPassword;
    }),
});

const ChangePassword = () => {
  const colors = tokens();
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const loggedInUsername = localStorage.getItem("loggedInUsername");
  const changePwdMutation = useMutation({
    mutationFn: (changePwdRequest) => authApi.changePwd(changePwdRequest),
  });

  const handleChangePasswordSubmit = (values, actions) => {
    const { reNewPassword, ...changePwdRequest } = values;
    changePwdMutation.mutate(changePwdRequest, {
      onSuccess: (data) => {
        localStorage.removeItem("loggedInUsername");
        localStorage.removeItem("accessToken");
        handleToast("success", data);
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
      height="500px"
    >
      <Formik
        onSubmit={handleChangePasswordSubmit}
        initialValues={{ ...initialValues, username: loggedInUsername }}
        validationSchema={changePwdSchema}
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
              bgcolor={colors.primary[100]}
              borderRadius="8px"
            >
              <Box gridColumn="span 4" textAlign="center" m="20px 0">
                <Typography variant="h2" fontWeight="bold">
                  Đổi mật khẩu
                </Typography>
              </Box>

              <TextField
                disabled={true}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Tài khoản *"
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
                  error={!!touched.newPassword && !!errors.newPassword}
                  htmlFor="outlined-adornment-password"
                >
                  Mật khẩu mới *
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPwd ? "text" : "password"}
                  label="Mật khẩu *"
                  fullWidth
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.newPassword}
                  name="newPassword"
                  error={!!touched.newPassword && !!errors.newPassword}
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
                {!!touched.newPassword && !!errors.newPassword && (
                  <FormHelperText error>{errors.newPassword}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                color="warning"
                sx={{ gridColumn: "span 4" }}
                variant="outlined"
                size="small"
              >
                <InputLabel
                  error={!!touched.reNewPassword && !!errors.reNewPassword}
                  htmlFor="outlined-adornment-password"
                >
                  Nhập lại mật khẩu mới *
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPwd ? "text" : "password"}
                  label="Mật khẩu *"
                  fullWidth
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.reNewPassword}
                  name="reNewPassword"
                  error={!!touched.reNewPassword && !!errors.reNewPassword}
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
                {!!touched.reNewPassword && !!errors.reNewPassword && (
                  <FormHelperText error>{errors.reNewPassword}</FormHelperText>
                )}
              </FormControl>

              <Box gridColumn="span 4" textAlign="center" m="10px">
                <Button
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="secondary"
                  type="submit"
                >
                  Đổi mật khẩu
                </Button>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default ChangePassword;
