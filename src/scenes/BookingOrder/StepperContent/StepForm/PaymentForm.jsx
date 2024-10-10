import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  useTheme,
  TextField,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, parse } from "date-fns";
import React, { useEffect, useState, useRef } from "react";
import { tokens } from "../../../../theme";
import useLogin from "../../../../utils/useLogin";
import { useQuery } from "@tanstack/react-query";
import * as userApi from "../../../../queries/user/userQueries";
import * as loyaltyApi from "../../../../queries/loyalty/loyaltyQueries"; // Add loyalty API
import { useTranslation } from "react-i18next";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// lấy giá cuối cùng sau khi áp mã
const getBookingPrice = (trip) => {
  let finalPrice = trip.price;
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }
  return finalPrice;
};

const PaymentForm = ({ field, setActiveStep, bookingData, setBookingData }) => {
  const colors = tokens();
  const theme = useTheme(); // use theme for controlling z-index and other styles
  const { trip, bookingDateTime, seatNumber, totalPayment } = bookingData;
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    field;
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState("");

  // Hàm format cho điểm xu (chuyển đổi sang đơn vị tiền tệ)
  const formatPointsToCurrency = (points) => {
    return formatCurrency(points);
  };

  // kiểm tra đã thanh toán thẻ chưa
  const [cardPaymentSelect, setCardPaymentSelect] = useState(
    bookingData.paymentMethod === "CARD" ? true : false
  );

  // Loyalty points (xu) state
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(""); // Ensure pointsToUse defaults to 0
  const [finalTotalPayment, setFinalTotalPayment] = useState(totalPayment);
  const [pointsApplied, setPointsApplied] = useState(false); // Trạng thái cho biết liệu điểm xu đã được áp dụng hay chưa
  const originalTotalPayment = useRef(totalPayment); // Lưu trữ tổng tiền ban đầu không thay đổi

  // nếu người dùng đã đăng nhập thì lấy thông tin của người dùng
  const isLoggedIn = useLogin();
  const loggedInUsername = localStorage.getItem("loggedInUsername");

  // lấy thông tin user
  const userInfoQuery = useQuery({
    queryKey: ["users", loggedInUsername],
    queryFn: () => userApi.getUser(loggedInUsername),
    enabled: isLoggedIn && loggedInUsername !== null,
  });

  // lấy điểm tích xu
  const loyaltyPointsQuery = useQuery({
    queryKey: ["loyaltyPoints"],
    queryFn: () => loyaltyApi.getLoyaltyPoints(),
    enabled: isLoggedIn && loggedInUsername !== null,
  });

  useEffect(() => {
    if (loyaltyPointsQuery.data) {
      setAvailablePoints(loyaltyPointsQuery.data.loyaltyPoints);
    }
  }, [loyaltyPointsQuery.data]);

  useEffect(() => {
    if (userInfoQuery?.data) {
      const { firstName, lastName, email, phone, address } = userInfoQuery.data;
      setFieldValue("user", userInfoQuery.data);
      setFieldValue("firstName", firstName);
      setFieldValue("lastName", lastName);
      setFieldValue("email", email);
      setFieldValue("phone", phone);
      setFieldValue("pickUpAddress", address);
    }
  }, [userInfoQuery.data, loggedInUsername]);

  const applyLoyaltyPoints = () => {
    let pointsToApply = parseFloat(pointsToUse);

    // Kiểm tra điểm xu hợp lệ
    if (isNaN(pointsToApply) || pointsToApply <= 0 || pointsToUse === "") {
        resetToInitialState();
        return;
    }

    if (pointsToApply > availablePoints) {
        setErrorMessage(t("Số điểm không hợp lệ hoặc vượt quá số điểm có thể sử dụng."));
        return;
    }

    if (pointsToApply > originalTotalPayment.current) {
        setErrorMessage(t("Số điểm vượt quá tổng tiền cần thanh toán."));
        return;
    }

    setErrorMessage("");
    const newTotal = Math.max(originalTotalPayment.current - pointsToApply, 0);

    // Log các giá trị để kiểm tra
    console.log("Tổng tiền mới:", newTotal);
    console.log("Điểm xu đã sử dụng:", pointsToApply);

    // Cập nhật bookingData
    setBookingData({
        ...bookingData,
        totalPayment: newTotal, // Cập nhật tổng tiền sau khi sử dụng điểm
        pointsUsed: pointsToApply, // Lưu điểm xu đã sử dụng
    });

    setFinalTotalPayment(newTotal);
    setPointsApplied(true);
};

// Đảm bảo khôi phục tổng tiền về giá trị ban đầu
const resetToInitialState = () => {
    setErrorMessage("");
    setFinalTotalPayment(originalTotalPayment.current); // Khôi phục tổng tiền ban đầu
    setPointsApplied(false);
    setPointsToUse("");

    console.log("Khôi phục về trạng thái ban đầu:", originalTotalPayment.current);

    // Cập nhật lại bookingData
    setBookingData({
        ...bookingData,
        totalPayment: originalTotalPayment.current,
        pointsUsed: 0, // Reset điểm xu đã sử dụng
    });
};

// Xử lý khi người dùng thay đổi số điểm xu
const handlePointsChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
        setPointsToUse(value);
        if (value === "") {
            resetToInitialState();
        }
    }
};

useEffect(() => {
    if (pointsToUse === "") {
        resetToInitialState(); // Khôi phục nếu không có điểm xu
    }
}, [pointsToUse]);


  return (
    <>
      <Box
        mt="40px"
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        justifyContent="center"
        gap="10px"
        bgcolor={colors.primary[100]}
        p="30px"
        borderRadius="10px"
      >
        {/* booking summary */}
        <Box
          gridColumn="span 5"
          display="flex"
          flexDirection="column"
          gap="10px"
        >
          <Typography variant="h4" fontWeight="bold" mb="16px">
            {t("Thông tin vé đặt")}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>{t("Tuyến")}: </span>
            {`${trip.source.name} ${
              bookingData.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
            } ${trip.destination.name}`}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>{t("Xe")}: </span>
            {trip.coach.name}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>{t("Loại")}: </span>
            {trip.coach.coachType}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>{t("Ngày giờ đi")}: </span>{" "}
            {format(
              parse(trip.departureDateTime, "yyyy-MM-dd HH:mm", new Date()),
              "HH:mm dd-MM-yyyy"
            )}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>{t("Tổng tiền")}: </span>
            {`${formatCurrency(originalTotalPayment.current)} (${
              seatNumber.length
            } x ${formatCurrency(getBookingPrice(trip))})`}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>{t("Ghế")}: </span>
            {seatNumber.join(", ")}
          </Typography>
        </Box>

        {/* payment info */}
        <Box
          gridColumn="span 7"
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        >
          {/* first name */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label={t("Họ *")}
            onBlur={handleBlur}
            onChange={(e) => setFieldValue("firstName", e.target.value)}
            value={values.firstName}
            name="firstName"
            error={!!touched.firstName && !!errors.firstName}
            helperText={touched.firstName && errors.firstName}
            sx={{
              gridColumn: "span 2",
            }}
          />

          {/* last name */}
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

          {/* phone */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label={t("Điện thoại *")}
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

          {/* email */}
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

          {/* pickup address */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label={t("Địa chỉ đón *")}
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.pickUpAddress}
            name="pickUpAddress"
            error={!!touched.pickUpAddress && !!errors.pickUpAddress}
            helperText={touched.pickUpAddress && errors.pickUpAddress}
            sx={{
              gridColumn: "span 4",
            }}
          />

          {/* Điểm Xu */}
          <Box
            sx={{
              gridColumn: "span 4",
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6">
              {t("Số điểm xu của bạn")}: {formatCurrency(availablePoints)}
            </Typography>
            <TextField
              type="text"
              label={t("Số điểm xu muốn sử dụng")}
              value={pointsToUse}
              onChange={handlePointsChange}
              disabled={pointsApplied}
            />
            <FormHelperText error>{errorMessage}</FormHelperText>
            <Button
              variant="contained"
              color="success"
              onClick={applyLoyaltyPoints}
              disabled={pointsApplied}
            >
              {pointsApplied ? t("Đã áp dụng") : t("Áp dụng điểm xu")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={resetToInitialState}
              disabled={!pointsApplied}
            >
              {t("Hủy áp dụng điểm xu")}
            </Button>

            <Typography variant="h6">
              {t("Tổng tiền sau khi giảm")}:{" "}
              {formatPointsToCurrency(finalTotalPayment)}
            </Typography>
          </Box>

          {/* Tổng tiền cần thanh toán */}
          <Typography
            component="span"
            variant="h6"
            sx={{ gridColumn: "span 4" }}
          >
            <span style={{ fontWeight: "bold" }}>
              {t("Tổng tiền cần thanh toán")}:{" "}
            </span>
            {formatCurrency(finalTotalPayment)}
          </Typography>

          {/* payment method */}
          <FormControl
            sx={{
              gridColumn: cardPaymentSelect ? "span 4" : "span 2",
            }}
          >
            <FormLabel color="warning" id="paymentMethod">
              Phương thức thanh toán
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="paymentMethod"
              name="row-radio-buttons-group"
              value={values.paymentMethod}
              onChange={(e) => {
                const paymentMethod = e.target.value;
                setCardPaymentSelect(paymentMethod === "CARD" ? true : false);
                setFieldValue("paymentMethod", paymentMethod);
                if (paymentMethod === "CASH") {
                  setFieldValue("paymentStatus", "UNPAID");
                } else setFieldValue("paymentStatus", "PAID");
              }}
            >
              <FormControlLabel
                value="CASH"
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
                label="Tiền mặt"
              />
              <FormControlLabel
                value="CARD"
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
                label="Thẻ visa"
              />
            </RadioGroup>
            {!cardPaymentSelect && (
              <FormHelperText sx={{ fontStyle: "italic", fontSize: "12px" }}>
                * Nhận vé và thanh toán tại quầy
              </FormHelperText>
            )}
          </FormControl>
        </Box>
      </Box>
    </>
  );
};

export default PaymentForm;
