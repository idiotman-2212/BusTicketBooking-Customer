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
  TextField,
  Typography,
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
  const colors = tokens();
  const { trip, bookingDateTime, seatNumber, totalPayment } = bookingData;
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    field;

  const [cardPaymentSelect, setCardPaymentSelect] = useState(
    bookingData.paymentMethod === "CARD" ? true : false
  );

  const isLoggedIn = useLogin();
  const loggedInUsername = localStorage.getItem("loggedInUsername");

  const userInfoQuery = useQuery({
    queryKey: ["users", loggedInUsername],
    queryFn: () => userApi.getUser(loggedInUsername),
    enabled: isLoggedIn && loggedInUsername !== null,
  });

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
            Thông tin vé đặt
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>Tuyến: </span>
            {`${trip.source.name} ${
              bookingData.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
            } ${trip.destination.name}`}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>Xe: </span>
            {trip.coach.name}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>Loại: </span>
            {trip.coach.coachType}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>Ngày giờ đi: </span>{" "}
            {format(
              parse(trip.departureDateTime, "yyyy-MM-dd HH:mm", new Date()),
              "HH:mm dd-MM-yyyy"
            )}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>Tổng tiền: </span>
            {`${formatCurrency(totalPayment)} (${
              seatNumber.length
            } x ${formatCurrency(getBookingPrice(trip))})`}
          </Typography>
          <Typography component="span" variant="h6">
            <span style={{ fontWeight: "bold" }}>Ghế: </span>
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
            label="Họ *"
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
            label="Tên *"
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
            label="Điện thoại *"
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

          {/* email*/}
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
            label="Địa chỉ đón *"
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

          {/* payment status */}
          {/* <FormControl
            sx={{
              gridColumn: "span 2",
              display: cardPaymentSelect ? "none" : "initial",
            }}
          >
            <FormLabel color="warning" id="paymentStatus">
              Payment Status
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="paymentStatus"
              name="row-radio-buttons-group"
              value={values.paymentStatus}
              onChange={(e) => {
                setFieldValue("paymentStatus", e.target.value);
              }}
            >
              <FormControlLabel
                value="UNPAID"
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
                label="UNPAID"
              />
              <FormControlLabel
                value="PAID"
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
                label="PAID"
              />
            </RadioGroup>
          </FormControl> */}

          {/* name on card */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label="Tên chủ thẻ *"
            onBlur={handleBlur}
            onChange={(e) => setFieldValue("nameOnCard", e.target.value)}
            value={values.nameOnCard}
            name="nameOnCard"
            error={!!touched.nameOnCard && !!errors.nameOnCard}
            helperText={touched.nameOnCard && errors.nameOnCard}
            sx={{
              display: cardPaymentSelect ? "initial" : "none",
              gridColumn: "span 2",
            }}
          />

          {/* card number */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label="Số thẻ *"
            onBlur={handleBlur}
            onChange={(e) => setFieldValue("cardNumber", e.target.value)}
            value={values.cardNumber}
            name="cardNumber"
            error={!!touched.cardNumber && !!errors.cardNumber}
            helperText={touched.cardNumber && errors.cardNumber}
            sx={{
              display: cardPaymentSelect ? "initial" : "none",
              gridColumn: "span 2",
            }}
          />

          {/* expired date */}
          <FormControl
            sx={{
              display: cardPaymentSelect ? "initial" : "none",
              gridColumn: "span 2",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                format="MM/yy"
                label="Ngày hết hạn"
                views={["year", "month"]}
                openTo="month"
                minDate={new Date()}
                maxDate={new Date(2050, 12, 41)}
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
                    size: "small",
                    color: "warning",
                    error: !!touched.expiredDate && !!errors.expiredDate,
                  },
                }}
              />
            </LocalizationProvider>
            {!!touched.expiredDate && !!errors.expiredDate && (
              <FormHelperText error>{errors.expiredDate}</FormHelperText>
            )}
          </FormControl>

          {/* cvv */}
          <TextField
            color="warning"
            size="small"
            fullWidth
            variant="outlined"
            type="text"
            label="CVV *"
            onBlur={handleBlur}
            onChange={(e) => setFieldValue("cvv", e.target.value)}
            value={values.cvv}
            name="cvv"
            error={!!touched.cvv && !!errors.cvv}
            helperText={touched.cvv && errors.cvv}
            sx={{
              display: cardPaymentSelect ? "initial" : "none",
              gridColumn: "span 2",
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default PaymentForm;
