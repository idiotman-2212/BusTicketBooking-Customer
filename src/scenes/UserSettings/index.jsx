import React from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { tokens } from "../../theme";
import * as userApi from "../../queries/user/userQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useLogin from "../../utils/useLogin";
import { parse, format } from "date-fns";
import { debounce } from "../../utils/debounce";
import * as yup from "yup";
import { messages } from "../../utils/validationMessages";
import { APP_CONSTANTS } from "../../utils/appContants";
import { Formik } from "formik";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { LoadingButton } from "@mui/lab";
import { handleToast } from "../../utils/helpers";
import { useTranslation } from "react-i18next";

const initialValues = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: format(new Date(), "yyyy-MM-dd"),
  gender: false,
  address: "",
  active: true,
  isEditMode: true, // remove this field when submit
};

const checkDuplicateEmailDebounced = debounce(
  userApi.checkDuplicateUserInfo,
  500
);
const checkDuplicatePhoneDebounced = debounce(
  userApi.checkDuplicateUserInfo,
  500
);

const userScheme = yup.object().shape({
  username: yup.string().notRequired(),
  password: yup.string().notRequired(),
  firstName: yup.string().required(messages.common.required),
  lastName: yup.string().required(messages.common.required),
  email: yup
    .string()
    .required(messages.common.required)
    .matches(APP_CONSTANTS.EMAIL_REGEX, messages.email.invalid)
    .test("email", "Địa chỉ email đã tồn tại", async (value, ctx) => {
      const isAvailable = await checkDuplicateEmailDebounced(
        "EDIT",
        ctx.parent.username,
        "email",
        value
      );
      return isAvailable;
    }),
  phone: yup
    .string()
    .required(messages.common.required)
    .matches(APP_CONSTANTS.PHONE_REGEX, messages.phone.invalid)
    .test("phone", "Số điện thoại đã được sử dụng", async (value, ctx) => {
      const isAvailable = await checkDuplicatePhoneDebounced(
        "EDIT",
        ctx.parent.username,
        "phone",
        value
      );
      return isAvailable;
    }),
  dob: yup
    .date()
    .max(new Date(), "Ngày sinh không được lớn hơn ngày hiện tại")
    .required(messages.common.required),
  // .test("dob", "Not old enough to work (age >= 18)", (value) => {
  //   // nhớ chỉ check tuổi đi làm đổi với nhân viên, khách thì kemeno
  //   const currentDate = new Date();
  //   const dob = new Date(value);
  //   const age = currentDate.getFullYear() - dob.getFullYear();
  //   return age >= 18;
  // }),
  gender: yup.boolean().default(false),
  address: yup.string().notRequired().default(""),
  active: yup.boolean().default(true),
  isEditMode: yup.boolean().default(true),
});

const UserSettings = () => {
  const colors = tokens();
  const isLoggedIn = useLogin();
  const loggedInUsername = localStorage.getItem("loggedInUsername");
  const queryClient = useQueryClient();
  const {t} = useTranslation();

  const userInfoQuery = useQuery({
    queryKey: ["users", loggedInUsername],
    queryFn: () => userApi.getUser(loggedInUsername),
    enabled: isLoggedIn && loggedInUsername !== null,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedUser) => userApi.updateUser(updatedUser),
  });

  const handleFormSubmit = (values, actions) => {
    let { isEditMode, ...newValues } = values;
    updateMutation.mutate(newValues, {
      onSuccess: (data) => {
        queryClient.setQueryData(["users", loggedInUsername], data);
        handleToast("success", t("Cập nhật thông tin thành công"));
      },
      onError: (error) => {
        console.log(error);
        handleToast("error", error.response?.data?.message);
      },
    });
  };

  return (
    <Box mt="100px" display="flex" justifyContent="center">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap="20px"
      >
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={
            userInfoQuery?.data
              ? { ...userInfoQuery?.data, isEditMode: true }
              : initialValues
          }
          validationSchema={userScheme}
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
              <Box textAlign="center" mb="30px">
                <Typography fontWeight="bold" variant="h3">
                  {t("Chỉnh sửa thông tin cá nhân")}
                </Typography>
              </Box>
              <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="30px"
                p="30px 40px"
                bgcolor={colors.primary[100]}
                borderRadius="8px"
              >
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label={t("Họ")}
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
                  label={t("Tên")}
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
                  label={t("Địa chỉ email")}
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
                  label={t("Số điện thoại")}
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

                <FormControl
                  sx={{
                    gridColumn: "span 2",
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      format="dd/MM/yyyy"
                      label={t("Ngày sinh")}
                      maxDate={new Date()}
                      value={parse(values.dob, "yyyy-MM-dd", new Date())}
                      onChange={(newDate) => {
                        setFieldValue("dob", format(newDate, "yyyy-MM-dd"));
                      }}
                      slotProps={{
                        textField: {
                          InputProps: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <CalendarMonthIcon />
                              </InputAdornment>
                            ),
                          },
                          size: "small",
                          color: "warning",
                          error: !!touched.dob && !!errors.dob,
                        },
                        dialog: {
                          sx: {
                            "& .MuiButton-root": {
                              color: colors.greyAccent[100],
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                  {!!touched.dob && !!errors.dob && (
                    <FormHelperText error>{errors.dob}</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label={t("Địa chỉ")}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.address !== null ? values.address : ""}
                  name="address"
                  error={!!touched.address && !!errors.address}
                  helperText={touched.address && errors.address}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />

                <FormControl
                  sx={{
                    gridColumn: "span 4",
                  }}
                >
                  <FormLabel color="warning" id="gender">
                    {t("Giới tính")}
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="gender"
                    name="row-radio-buttons-group"
                    value={values.gender}
                    onChange={(e) => {
                      setFieldValue("gender", e.currentTarget.value);
                    }}
                  >
                    <FormControlLabel
                      value="false"
                      label={t("Nam")}
                      control={
                        <Radio
                          sx={{
                            color: "#00a0bd",
                            "&.Mui-checked": {
                              color: "#00a0bd",
                            },
                          }}
                        />
                      }
                    />
                    <FormControlLabel
                      value="true"
                      label={t("Nữ")}
                      control={
                        <Radio
                          sx={{
                            color: "#00a0bd",
                            "&.Mui-checked": {
                              color: "#00a0bd",
                            },
                          }}
                        />
                      }
                    />
                  </RadioGroup>
                </FormControl>
                <Box
                  //   mt="20px"
                  display="flex"
                  justifyContent="center"
                  gridColumn="span 4"
                >
                  <LoadingButton
                    disableRipple
                    disableElevation
                    color="secondary"
                    type="submit"
                    variant="contained"
                    loadingPosition="start"
                    loading={updateMutation.isLoading}
                    startIcon={<SaveAsOutlinedIcon />}
                  >
                    {t("Lưu")}
                  </LoadingButton>
                </Box>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default UserSettings;
