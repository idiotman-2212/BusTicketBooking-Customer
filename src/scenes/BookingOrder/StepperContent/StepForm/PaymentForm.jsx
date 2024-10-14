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
  FormLabel,
  Radio,
  RadioGroup,
  InputAdornment,
  Divider,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, parse } from "date-fns";
import { useTheme } from "@mui/material/styles";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PaymentIcon from "@mui/icons-material/Payment";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import * as userApi from "../../../../queries/user/userQueries";
import * as loyaltyApi from "../../../../queries/loyalty/loyaltyQueries";
import * as cargoApi from "../../../../queries/cargo/cargoQueries";

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

const PaymentForm = ({ field, setActiveStep, bookingData, setBookingData }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { trip, bookingDateTime, seatNumber, totalPayment } = bookingData;
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } = field;
  const [errorMessage, setErrorMessage] = useState("");
  const [cardPaymentSelect, setCardPaymentSelect] = useState(bookingData.paymentMethod === "CARD");
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState("");
  const [finalTotalPayment, setFinalTotalPayment] = useState(totalPayment);
  const [pointsApplied, setPointsApplied] = useState(false);
  const [originalTotalPayment, setOriginalTotalPayment] = useState(totalPayment);
  const [selectedServices, setSelectedServices] = useState({});

  const isLoggedIn = true; // Replace with your actual login check
  const loggedInUsername = localStorage.getItem("loggedInUsername");

  const { data: cargos, isLoading } = useQuery(["cargos"], cargoApi.getAllCargos);

  const userInfoQuery = useQuery({
    queryKey: ["users", loggedInUsername],
    queryFn: () => userApi.getUser(loggedInUsername),
    enabled: !!loggedInUsername, // kiểm tra kỹ
  });

  const loyaltyPointsQuery = useQuery({
    queryKey: ["loyaltyPoints"],
    queryFn: () => loyaltyApi.getLoyaltyPoints(),
    enabled: !!loggedInUsername,  // kiểm tra kỹ
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
    console.log("Giá vé ban đầu: ", total);

    // Tính tổng chi phí cho các dịch vụ bổ sung (cargos)
    Object.entries(selectedServices).forEach(([cargoId, quantity]) => {
      if (quantity > 0) { // Chỉ tính khi số lượng > 0
        const cargo = cargos.find(c => c.id === parseInt(cargoId));
        if (cargo) {
          total += cargo.basePrice * quantity;
        }
      }
    });
    console.log("Tổng tiền sau khi thêm dịch vụ: ", total);
    return total;
  };

  const handleServiceChange = (id, quantity) => {
    if (quantity >= 0) { // Chỉ thay đổi nếu số lượng >= 0
      setSelectedServices(prev => {
        const newServices = { ...prev, [id]: quantity };

        // Tính toán lại tổng tiền khi có thay đổi dịch vụ
        const newTotal = calculateTotalPayment();
        console.log("Giá tiền sau khi thêm dịch vụ: ", newTotal);

        // Cập nhật tổng tiền và các dịch vụ đã chọn trong bookingData
        setFinalTotalPayment(newTotal);
        setBookingData(prevData => ({
          ...prevData,
          totalPayment: newTotal,
          cargoRequests: Object.entries(newServices).map(([cargoId, quantity]) => ({
            cargoId: parseInt(cargoId),
            quantity
          }))
        }));

        return newServices;
      });
    }
  };

  useEffect(() => {
    const newTotal = calculateTotalPayment();
    setFinalTotalPayment(newTotal);
    setBookingData(prevData => ({
      ...prevData,
      totalPayment: newTotal,
      cargoRequests: Object.entries(selectedServices).map(([cargoId, quantity]) => ({
        cargoId: parseInt(cargoId),
        quantity
      }))
    }));
  }, [selectedServices]);

  const applyLoyaltyPoints = () => {
    let pointsToApply = parseFloat(pointsToUse);

    if (isNaN(pointsToApply) || pointsToApply <= 0 || pointsToUse === "") {
      resetToInitialState();
      return;
    }

    if (pointsToApply > availablePoints) {
      setErrorMessage(t("Số điểm không hợp lệ hoặc vượt quá số điểm có thể sử dụng."));
      return;
    }

    if (pointsToApply > finalTotalPayment) {
      setErrorMessage(t("Số điểm vượt quá tổng tiền cần thanh toán."));
      return;
    }

    setErrorMessage("");
    const newTotal = Math.max(finalTotalPayment - pointsToApply, 0);
    console.log("Tổng tiền sau khi áp dụng điểm xu: ", newTotal);

    setBookingData(prevData => ({
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

    setBookingData(prevData => ({
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

  console.log("Tổng tiền cuối cùng sau khi tính tất cả: ", finalTotalPayment);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("Thông tin vé đặt")}
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  <DirectionsBusIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>{t("Tuyến")}:</strong> {`${trip?.source?.name ?? ''} ${
                    bookingData.bookingType === "ONEWAY" ? `→` : `↔`
                  } ${trip?.destination?.name ?? ''}`}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <DirectionsBusIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>{t("Xe")}:</strong> {trip?.coach?.name ?? ''}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <DirectionsBusIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>{t("Loại")}:</strong> {trip?.coach?.coachType ?? ''}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>{t("Ngày giờ đi")}:</strong>{" "}
                  {trip?.departureDateTime
                    ? format(parse(trip?.departureDateTime, "yyyy-MM-dd HH:mm", new Date()), "HH:mm dd-MM-yyyy")
                    : ''}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  <strong>{t("Tổng tiền")}:</strong>{" "}
                  {`${formatCurrency(originalTotalPayment)} (${seatNumber.length} x ${formatCurrency(getBookingPrice(trip))})`}
                </Typography>
                <Typography variant="body1">
                  <EventSeatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
                  label={t("Điện thoại")}
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
                  name="pickUpAddress"
                  value={values.pickUpAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.pickUpAddress && Boolean(errors.pickUpAddress)}
                  helperText={touched.pickUpAddress && errors.pickUpAddress}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
              {t("Choose Additional Services")}
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
              {cargos?.map((cargo) => (
                <Card key={cargo.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={8}>
                      <Typography>{cargo.name} - {formatCurrency(cargo.basePrice)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        type="number"
                        size="small"
                        value={selectedServices[cargo.id] ?? 0}
                        onChange={(e) => handleServiceChange(cargo.id, Number(e.target.value))}
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
              <LoyaltyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
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
                  color="primary"
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

        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">{t("Phương thức thanh toán")}</FormLabel>
          <RadioGroup
           row
            aria-label="payment method"
            name="paymentMethod"
            value={values.paymentMethod}
            onChange={(e) => {
              const paymentMethod = e.target.value;
              setCardPaymentSelect(paymentMethod === "CARD");
              setFieldValue("paymentMethod", paymentMethod);
              setFieldValue("paymentStatus", paymentMethod === "CASH" ? "UNPAID" : "PAID");
            }}
          >
            <FormControlLabel
              value="CASH"
              control={<Radio />}
              label={t("Tiền mặt")}
            />
            <FormControlLabel
              value="CARD"
              control={<Radio />}
              label={t("Thẻ visa")}
            />
          </RadioGroup>
          {!cardPaymentSelect && (
            <Typography variant="caption" sx={{ fontStyle: "italic", mt: 1 }}>
              * {t("Nhận vé và thanh toán tại quầy")}
            </Typography>
          )}
        </FormControl>
      </Paper>
    </LocalizationProvider>
  );
};

export default PaymentForm;
