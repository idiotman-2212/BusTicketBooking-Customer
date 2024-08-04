import React from "react";
import { Formik } from "formik";
import { debounce } from "../../utils/debounce";
import { messages } from "../../utils/validationMessages";
import * as yup from "yup";
import { APP_CONSTANTS } from "../../utils/appContants";
import * as authApi from "../../queries/auth/authQueries";
import { tokens } from "../../theme";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, colors } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { handleToast } from "../../utils/helpers";

const initialValues = {
  email: "",
};

const checkExistEmailDebounced = debounce(authApi.checkExistEmail, 500);

const forotSchema = yup.object().shape({
  email: yup
    .string()
    .required(messages.common.required)
    .matches(APP_CONSTANTS.EMAIL_REGEX, messages.email.invalid)
    .test(
      "email",
      "Địa chỉ chưa từng được sử dụng để đăng ký tài khoản",
      async (value) => {
        const isAvailable = await checkExistEmailDebounced(value);
        return isAvailable;
      }
    ),
});

const ForgotPwd = () => {
  const colors = tokens();
  const navigate = useNavigate();

  const forgotPwdMutation = useMutation({
    mutationFn: (email) => authApi.forgot(email),
  });

  const handleForgotSubmit = (values) => {
    forgotPwdMutation.mutate(values, {
      onSuccess: (data) => {
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
        onSubmit={handleForgotSubmit}
        initialValues={initialValues}
        validationSchema={forotSchema}
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
                  Khôi phục mật khẩu
                </Typography>
              </Box>
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Địa chỉ email *"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              <Box gridColumn="span 4" textAlign="center" m="10px">
                <Button
                  disableElevation
                  disableRipple
                  variant="contained"
                  color="secondary"
                  type="submit"
                >
                  Gửi email
                </Button>
              </Box>

              <Box
                mb="20px"
                display="flex"
                gridColumn="span 4"
                textAlign="center"
                justifyContent="center"
                flexDirection="column"
                gap="10px"
              >
                <Box>
                  <Typography component="span" variant="h5">
                    Đã có tài khoản ?
                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <Typography component="span" variant="h5">
                        {" "}
                        Đăng nhập
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
                <Box>
                  <Typography component="span" variant="h5">
                    Chưa có tài khoản ?
                    <Link to="/register" style={{ textDecoration: "none" }}>
                      <Typography component="span" variant="h5">
                        {" "}
                        Đăng ký
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

export default ForgotPwd;
