import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Divider,
  Paper,
  useTheme,
  Checkbox,
  Link,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, parse } from "date-fns";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PaymentIcon from "@mui/icons-material/Payment";
import StarsIcon from "@mui/icons-material/Stars";
import RouteIcon from "@mui/icons-material/Route";
import RoomIcon from "@mui/icons-material/Room";
import PinDropIcon from "@mui/icons-material/PinDrop";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CommuteIcon from "@mui/icons-material/Commute";
import PlaceIcon from "@mui/icons-material/Place";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";

import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import * as userApi from "../../../../queries/user/userQueries";
import * as loyaltyApi from "../../../../queries/loyalty/loyaltyQueries";
import * as cargoApi from "../../../../queries/cargo/cargoQueries";
import { ColorModeContext, tokens } from "../../../../theme";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getBookingPrice = (trip) => {
  let finalPrice = trip.price;
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }
  return finalPrice;
};

const PaymentForm = ({
  field,
  setActiveStep,
  bookingData,
  setBookingData,
  onOpenRegulations,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);
  const { t } = useTranslation();
  const { trip, bookingDateTime, seatNumber, totalPayment } = bookingData;
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    field;
  const [errorMessage, setErrorMessage] = useState("");
  const [cardPaymentSelect, setCardPaymentSelect] = useState(
    bookingData.paymentMethod === "CARD" ? true : false
  );
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState("");
  const [finalTotalPayment, setFinalTotalPayment] = useState(totalPayment);
  const [pointsApplied, setPointsApplied] = useState(false);
  const [originalTotalPayment, setOriginalTotalPayment] =
    useState(totalPayment);
  const [selectedServices, setSelectedServices] = useState({});
  const isLoggedIn = true; // Replace with your actual login check
  const loggedInUsername = localStorage.getItem("loggedInUsername");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)
  const navigate = useNavigate();

  const { data: cargos, isLoading } = useQuery(
    ["cargos"],
    cargoApi.getAllCargos
  );

  const userInfoQuery = useQuery({
    queryKey: ["users", loggedInUsername],
    queryFn: () => userApi.getUser(loggedInUsername),
    enabled: !!loggedInUsername, // kiểm tra kỹ
  });

  const loyaltyPointsQuery = useQuery({
    queryKey: ["loyaltyPoints"],
    queryFn: () => loyaltyApi.getLoyaltyPoints(),
    enabled: !!loggedInUsername, // kiểm tra kỹ
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

  const calculateTotalPayment = () => {
    let total = originalTotalPayment; // Lấy tổng tiền gốc ban đầu (giá vé)

    // Tính tổng chi phí cho các dịch vụ bổ sung (cargos)
    Object.entries(selectedServices).forEach(([cargoId, quantity]) => {
      if (quantity > 0) {
        // Chỉ tính khi số lượng > 0
        const cargo = cargos.find((c) => c.id === parseInt(cargoId));
        if (cargo) {
          total += cargo.basePrice * quantity;
        }
      }
    });
    return total;
  };

  const handleServiceChange = (id, quantity) => {
    if (quantity >= 0) {
      // Chỉ thay đổi nếu số lượng >= 0
      setSelectedServices((prev) => {
        const newServices = { ...prev, [id]: quantity };

        // Tính toán lại tổng tiền khi có thay đổi dịch vụ
        const newTotal = calculateTotalPayment();

        // Cập nhật tổng tiền và các dịch vụ đã chọn trong bookingData
        setFinalTotalPayment(newTotal);
        setBookingData((prevData) => ({
          ...prevData,
          totalPayment: newTotal,
          cargoRequests: Object.entries(newServices).map(
            ([cargoId, quantity]) => ({
              cargoId: parseInt(cargoId),
              quantity,
            })
          ),
        }));

        return newServices;
      });
    }
  };

  useEffect(() => {
    const newTotal = calculateTotalPayment();
    setFinalTotalPayment(newTotal);
    setBookingData((prevData) => ({
      ...prevData,
      totalPayment: newTotal,
      cargoRequests: Object.entries(selectedServices).map(
        ([cargoId, quantity]) => ({
          cargoId: parseInt(cargoId),
          quantity,
        })
      ),
    }));
  }, [selectedServices]);

  const applyLoyaltyPoints = () => {
    let pointsToApply = parseFloat(pointsToUse);

    if (isNaN(pointsToApply) || pointsToApply <= 0 || pointsToUse === "") {
      resetToInitialState();
      return;
    }

    if (pointsToApply > availablePoints) {
      setErrorMessage(
        t("Số điểm không hợp lệ hoặc vượt quá số điểm có thể sử dụng.")
      );
      return;
    }

    if (pointsToApply > finalTotalPayment) {
      setErrorMessage(t("Số điểm vượt quá tổng tiền cần thanh toán."));
      return;
    }

    setErrorMessage("");
    const newTotal = Math.max(finalTotalPayment - pointsToApply, 0);
    console.log("Tổng tiền sau khi áp dụng điểm xu: ", newTotal);

    setBookingData((prevData) => ({
      ...prevData,
      totalPayment: newTotal,
      pointsUsed: pointsToApply,
    }));

    setFinalTotalPayment(newTotal);
    setPointsApplied(true);
  };

  const resetToInitialState = () => {
    setErrorMessage("");
    const newTotal = calculateTotalPayment();
    setFinalTotalPayment(newTotal);
    setPointsApplied(false);
    setPointsToUse("");

    setBookingData((prevData) => ({
      ...prevData,
      totalPayment: newTotal,
      pointsUsed: 0,
    }));
  };

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
      resetToInitialState();
    }
  }, [pointsToUse]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    if (timeLeft === 0) {
      clearInterval(timerId);
      alert("Thời gian thanh toán đã hết. Quay lại bước đặt vé.");
      setActiveStep(0); // Go back to the booking step
      navigate("/booking"); // Redirect to the trip selection page
    }

    return () => clearInterval(timerId);
  }, [timeLeft, setActiveStep, navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district, province } = location;
    return `${address || ""}${ward ? ", " + ward : ""}${
      district ? ", " + district : ""
    }${province?.name ? ", " + province.name : ""}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("Thông tin vé đặt")}
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  <RouteIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Tuyến")}:</strong>{" "}
                  {`${trip?.source?.name ?? ""} ${
                    bookingData.bookingType === "ONEWAY" ? `→` : `↔`
                  } ${trip?.destination?.name ?? ""}`}
                </Typography>
                {/* Thêm thông tin điểm đón và trả */}
                <Typography variant="body1" gutterBottom>
                  <RoomIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Điểm đón")}:</strong>{" "}
                  {formatLocation(trip.pickUpLocation)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <PinDropIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Điểm trả")}:</strong>{" "}
                  {formatLocation(trip.dropOffLocation)}
                </Typography>

                <Typography variant="body1" gutterBottom>
                  <DirectionsBusIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Xe")}:</strong> {trip?.coach?.name ?? ""}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <CommuteIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Loại")}:</strong> {trip?.coach?.coachType ?? ""}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <CalendarMonthIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Ngày giờ đi")}:</strong>{" "}
                  {trip?.departureDateTime
                    ? format(
                        parse(
                          trip?.departureDateTime,
                          "yyyy-MM-dd HH:mm",
                          new Date()
                        ),
                        "HH:mm dd-MM-yyyy"
                      )
                    : ""}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <PaymentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Tổng tiền")}:</strong>{" "}
                  {`${formatCurrency(originalTotalPayment)} (${
                    seatNumber.length
                  } x ${formatCurrency(getBookingPrice(trip))})`}
                </Typography>
                <Typography variant="body1">
                  <EventSeatIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  <strong>{t("Ghế")}:</strong> {seatNumber.join(", ")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("Thông tin khách hàng")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("Họ")}
                  variant="outlined"
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("Tên")}
                  variant="outlined"
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("Số điện thoại")}
                  variant="outlined"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("Địa chỉ email")}
                  variant="outlined"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("Địa chỉ đón")}
                  variant="outlined"
                  name="pickUpLocation"
                  value={formatLocation(trip.pickUpLocation)}
                  error={
                    touched.pickUpLocation && Boolean(errors.pickUpLocation)
                  }
                  helperText={touched.pickUpLocation && errors.pickUpLocation}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("Địa chỉ trả")}
                  variant="outlined"
                  name="dropOffLocation"
                  value={formatLocation(trip.dropOffLocation)}
                  error={
                    touched.dropOffLocation && Boolean(errors.dropOffLocation)
                  }
                  helperText={touched.dropOffLocation && errors.dropOffLocation}
                />
              </Grid>
            </Grid>
            {/* Checkbox Xác Nhận Quy Định */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.hasReadRegulations}
                  onChange={handleChange}
                  name="hasReadRegulations"
                  color="primary"
                />
              }
              label={
                <Typography>
                  {t("Tôi đã đọc và đồng ý với các quy định của nhà xe.")}{" "}
                  <Link href="#" onClick={onOpenRegulations}>
                    {t("Nội quy của nhà xe")}
                  </Link>
                </Typography>
              }
            />

            <Typography variant="h6" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
              {t("Chọn dịch vụ bổ sung")}
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: "auto", mb: 2 }}>
              {cargos?.map((cargo) => (
                <Card key={cargo.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={8}>
                      <Typography>
                        {cargo.name} - {formatCurrency(cargo.basePrice)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        type="number"
                        size="small"
                        value={selectedServices[cargo.id] ?? 0}
                        onChange={(e) =>
                          handleServiceChange(cargo.id, Number(e.target.value))
                        }
                        inputProps={{ min: 0 }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <StarsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {t("Số điểm xu của bạn")}: {formatCurrency(availablePoints)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label={t("Số điểm xu muốn sử dụng")}
                  variant="outlined"
                  value={pointsToUse}
                  onChange={handlePointsChange}
                  disabled={pointsApplied}
                  error={Boolean(errorMessage)}
                  helperText={errorMessage}
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={applyLoyaltyPoints}
                  disabled={pointsApplied}
                  fullWidth
                >
                  {pointsApplied ? t("Đã áp dụng") : t("Áp dụng")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          {pointsApplied && (
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="secondary"
                onClick={resetToInitialState}
                fullWidth
              >
                {t("Hủy áp dụng điểm xu")}
              </Button>
            </Grid>
          )}
        </Grid>

        <Typography variant="h6" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
          {t("Tổng tiền cần thanh toán")}: {formatCurrency(finalTotalPayment)}
        </Typography>

        {/* Countdown Timer Display */}
        <Typography variant="h6" color="error" sx={{ mt: 2, mb: 2 }}>
          {t("Thời gian còn lại để thanh toán")}: {formatTime(timeLeft)}
        </Typography>

        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">
            {t("Phương thức thanh toán")}
          </FormLabel>
          <RadioGroup
            row
            aria-label="payment method"
            name="paymentMethod"
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
              label={t("Tiền mặt")}
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
              label={t("Thẻ visa")}
            />
          </RadioGroup>
          {!cardPaymentSelect && (
            <Typography variant="caption" sx={{ fontStyle: "italic", mt: 1 }}>
              * {t("Nhận vé và thanh toán tại quầy")}
            </Typography>
          )}
        </FormControl>

        {/* thẻ visa */}
        <FormControl
          sx={{
            display: cardPaymentSelect ? "initial" : "none",
            gridColumn: "span 2",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <Card
            sx={{
              p: 2,
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              boxShadow: theme.shadows[2],
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight="bold">
                {t("Thông tin thẻ Visa")}
              </Typography>
              <img
                src="../../../../../public/visa.png"
                alt="Visa"
                width="50"
                style={{
                  filter: theme.palette.mode === "dark" ? "invert(1)" : "none", // Đảo màu logo trong dark mode
                }}
              />
            </Box>

            {/* Tên chủ thẻ */}
            <TextField
              fullWidth
              variant="outlined"
              label={t("Tên chủ thẻ *")}
              value={values.nameOnCard}
              onBlur={handleBlur}
              onChange={(e) => setFieldValue("nameOnCard", e.target.value)}
              error={!!touched.nameOnCard && !!errors.nameOnCard}
              helperText={touched.nameOnCard && errors.nameOnCard}
              sx={{ mb: 2 }}
            />

            {/* Số thẻ */}
            <TextField
              fullWidth
              variant="outlined"
              label={t("Số thẻ *")}
              value={values.cardNumber}
              onBlur={handleBlur}
              onChange={(e) => setFieldValue("cardNumber", e.target.value)}
              error={!!touched.cardNumber && !!errors.cardNumber}
              helperText={touched.cardNumber && errors.cardNumber}
              sx={{ mb: 2 }}
            />

            {/* Ngày hết hạn và CVV */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    format="MM/yy"
                    label={t("Ngày hết hạn")}
                    views={["year", "month"]}
                    openTo="month"
                    minDate={new Date()}
                    value={parse(values.expiredDate, "MM/yy", new Date())}
                    onChange={(newDate) => {
                      setFieldValue("expiredDate", format(newDate, "MM/yy"));
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
                        fullWidth: true,
                        error: !!touched.expiredDate && !!errors.expiredDate,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="CVV *"
                  value={values.cvv}
                  onBlur={handleBlur}
                  onChange={(e) => setFieldValue("cvv", e.target.value)}
                  error={!!touched.cvv && !!errors.cvv}
                  helperText={touched.cvv && errors.cvv}
                />
              </Grid>
            </Grid>
          </Card>
        </FormControl>
      </Box>
    </LocalizationProvider>
  );
};

export default PaymentForm;
