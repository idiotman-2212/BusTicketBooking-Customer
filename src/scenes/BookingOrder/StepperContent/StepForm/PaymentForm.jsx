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
import React, { useEffect, useState } from "react";
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

//lấy giá cuối cùng sau khi áp mã
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

  //kiểm tra đã thanh toán thẻ chưa
  const [cardPaymentSelect, setCardPaymentSelect] = useState(
    bookingData.paymentMethod === "CARD" ? true : false
  );

  // Phương thức thanh toán được chọn
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Loyalty points (xu) state
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(""); // Ensure pointsToUse defaults to 0
  const [finalTotalPayment, setFinalTotalPayment] = useState(totalPayment);

  //nếu người dùng đã đăng nhập thì lấy thông tin của người dùng
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

  // Áp dụng xu vào tổng tiền
  const applyLoyaltyPoints = () => {
    let pointsToApply = parseFloat(pointsToUse);
    if (
      isNaN(pointsToApply) ||
      pointsToApply <= 0 ||
      pointsToApply > availablePoints
    ) {
      setErrorMessage(
        t("Số điểm không hợp lệ hoặc vượt quá số điểm có thể sử dụng.")
      );
      return;
    }

    setErrorMessage("");
    const discountAmount = pointsToApply;
    const newTotal = Math.max(bookingData.totalPayment - discountAmount, 0);
    setFinalTotalPayment(newTotal);
  };

  // Hàm xử lý khi thanh toán
  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    // Logic xử lý cho từng phương thức thanh toán
    switch (selectedPaymentMethod) {
      case "VNPAY":
        console.log("Đang xử lý thanh toán qua VNPay...");
        break;
      case "MOMO":
        console.log("Đang xử lý thanh toán qua MoMo...");
        break;
      case "BANK":
        console.log("Đang xử lý thanh toán qua ngân hàng...");
        break;
      case "CREDIT_CARD":
        console.log("Đang xử lý thanh toán qua thẻ tín dụng...");
        break;
      default:
        console.error("Phương thức thanh toán không hợp lệ.");
    }
  };

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
            {`${formatCurrency(totalPayment)} (${
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
            <Typography variant="h6" sx={{ marginBottom: "12px" }}>
              {t("Số điểm xu của bạn")}: {formatCurrency(availablePoints)}
            </Typography>
            <TextField
              type="text" // Thay đổi kiểu nhập để tránh vấn đề với input number
              label={t("Số điểm xu muốn sử dụng")}
              value={pointsToUse}
              onChange={(e) => {
                const value = e.target.value;
                // Chỉ cho phép người dùng nhập số
                if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setPointsToUse(value);
                }
              }}
            />
            <FormHelperText error>{errorMessage}</FormHelperText>
            <Button
              variant="contained"
              color="success"
              onClick={applyLoyaltyPoints}
              disabled={
                parseFloat(pointsToUse) <= 0 ||
                isNaN(parseFloat(pointsToUse)) ||
                parseFloat(pointsToUse) > availablePoints
              } // Thêm điều kiện để vô hiệu hóa nút
            >
              {t("Áp dụng điểm xu")}
            </Button>

            {/* Hiển thị tổng tiền sau khi giảm */}
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

          {/* Payment method selection */}
          <FormControl
            fullWidth
            sx={{ gridColumn: "span 4", zIndex: 1 }}
            variant="outlined"
          >
            <InputLabel id="payment-method-label">
              {t("Phương thức thanh toán")}
            </InputLabel>
            <Select
              labelId="payment-method-label"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              label={t("Phương thức thanh toán")}
              color="warning"
              size="small"
            >
              <MenuItem value="VNPAY">VNPay</MenuItem>
              <MenuItem value="MOMO">MoMo</MenuItem>
              <MenuItem value="BANK">Ngân hàng</MenuItem>
              <MenuItem value="CREDIT_CARD">Thẻ tín dụng</MenuItem>
            </Select>
            {!selectedPaymentMethod && (
              <FormHelperText error>
                {t("Vui lòng chọn phương thức thanh toán.")}
              </FormHelperText>
            )}
          </FormControl>

          {/* Nút thanh toán */}
          <Button
            variant="contained"
            color="primary"
            onClick={handlePayment}
            sx={{ gridColumn: "span 4" }}
          >
            {t("Thanh toán")}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default PaymentForm;
