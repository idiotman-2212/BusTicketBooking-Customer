import SaveAsOutlinedIcon from "@mui/icons-material/SaveAsOutlined";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { format } from "date-fns";
import { Formik } from "formik";
import React, { useState } from "react";
import PaymentForm from "./StepForm/PaymentForm";
import SeatForm from "./StepForm/SeatForm";
import TripForm from "./StepForm/TripForm";
import validationSchema from "../validationSchema";
import * as bookingApi from "../../../queries/booking/ticketQueries";
import { useMutation } from "@tanstack/react-query";
import { handleToast } from "../../../utils/helpers";
// import Header from "../../../components/Header";
import { useTranslation } from "react-i18next";
import { ColorModeContext, tokens } from "../../../theme";
import { useContext } from "react";
import Regulation from "../../Regulation";

const initialValues = {
  id: -1,
  user: null,
  trip: null,
  source: null, // remove when submit
  destination: null, // remove when submit
  from: format(new Date(), "yyyy-MM-dd"), // remove when submit
  to: format(new Date(), "yyyy-MM-dd"), // remove when submit
  bookingDateTime: format(new Date(), "yyyy-MM-dd HH:mm"),
  seatNumber: [], // user can choose max 5 seat, in that case: create 5 tickets
  bookingType: "ONEWAY",
  firstName: "", // used for create user
  lastName: "", // used for create user
  phone: "", // used for create user
  email: "", // used for create user
  totalPayment: 0,
  paymentDateTime: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  paymentMethod: "CASH",
  paymentStatus: "UNPAID",
  nameOnCard: "", // used to validate when paymentMethod is CARD, remove when submit
  cardNumber: "", // used to validate when paymentMethod is CARD, remove when submit
  expiredDate: format(new Date(), "MM/yy"), // used to validate when paymentMethod is CARD, remove when submit
  cvv: "", // used to validate when paymentMethod is CARD, remove when submit
  isEditMode: false, // remove this field when submit
  pointsUsed: 0, // Thêm trường pointsUsed
  cargoRequests: [],
  hasReadRegulations: false,
};

const renderStepContent = (
  step,
  field,
  setActiveStep,
  bookingData,
  setBookingData,
  onOpenRegulations
) => {
  switch (step) {
    case 0:
      return (
        <TripForm
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      );
    case 1:
      return (
        <SeatForm
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      );
    case 2:
      return (
        <PaymentForm
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
          onOpenRegulations={onOpenRegulations}
        />
      );
    default:
      return <Typography variant="h4"> Không tìm thấy</Typography>;
  }
};

const StepperBooking = () => {
  const { t } = useTranslation();
  const steps = [t("Chọn chuyến"), t("Chọn chỗ"), t("Thanh toán")];
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState(initialValues);
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);
  const [showRegulations, setShowRegulations] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpenRegulations = () => {
    setShowRegulations(true);
  };

  // Hàm đóng modal quy định
  const handleCloseRegulations = () => {
    setShowRegulations(false);
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // create new Bookings
  const createMutation = useMutation({
    mutationFn: (newBookings) => bookingApi.createNewBookings(newBookings),
  });

  // main process submit form
  const submitForm = (values, actions) => {
    const {
      source,
      destination,
      nameOnCard,
      cardNumber,
      expiredDate,
      cvv,
      isEditMode,
      ...newValues
    } = values;

    // Cập nhật totalPayment và pointsUsed từ bookingData
    newValues.totalPayment = bookingData.totalPayment; // Sử dụng giá trị đã cập nhật
    newValues.pointsUsed = bookingData.pointsUsed; // Sử dụng giá trị đã cập nhật
    newValues.cargoRequests = bookingData.cargoRequests;

    actions.setSubmitting(false);

    createMutation.mutate(newValues, {
      onSuccess: () => {
        actions.resetForm();
        handleToast("success", t("Thêm đặt chỗ mới thành công"));
      },
      onError: (error) => {
        console.log(error);
        if (error.response?.status === 400) { // Giả sử mã lỗi 409 là do ghế đã bị đặt
          handleToast("error", t("Chỗ ngồi đã được đặt, vui lòng chọn chỗ khác."));
          setActiveStep(1); // Quay lại bước chọn chỗ ngồi
        } else {
          // handleToast("error", error.response?.data?.message || t("Đặt vé không thành công. Vui lòng thử lại."));
        }
      },
    });

    // setActiveStep(0);
    handleNext(); // khi nao thanh cong thi chuyen trang success
  };

  // handle submit
  const handleFormSubmit = (values, actions) => {
    if (isLastStep) {
      submitForm(values, actions);
    } else {
      handleNext();
      actions.setSubmitting(false);
      setBookingData(values);
    }
  };

  return (
    <Box
      m="0"
      p={isSmallScreen ? "10px" : "20px"}
      bgcolor={theme.palette.background.default} // Màu nền từ theme
      color={theme.palette.text.primary} // Màu chữ từ theme
    >
      {/* <Header title={undefined} subTitle={"CREATE BOOKING"} /> */}

      <Box mt="100px">
        <Stepper
          activeStep={activeStep}
          orientation={isSmallScreen ? "vertical" : "horizontal"}
        >
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mt="50px"
          >
            <Typography variant="h1">{t("Cảm ơn quý khách")}</Typography>
          </Box>
        ) : (
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={currentValidationSchema}
            enableReinitialize={true}
          >
            {({ isSubmitting, handleSubmit, ...rest }) => (
              <form onSubmit={handleSubmit}>
                <Box m={isSmallScreen ? "10px 0" : "20px 0"}>
                  {renderStepContent(
                    activeStep,
                    rest,
                    setActiveStep,
                    bookingData,
                    setBookingData,
                    handleOpenRegulations
                  )}
                </Box>
                <Box
                  mt="20px"
                  display="flex"
                  flexDirection={isSmallScreen ? "column" : "row"}
                  justifyContent="center"
                >
                  {activeStep !== 0 && (
                    <Button
                      disableElevation
                      disableRipple
                      color="success"
                      variant="contained"
                      onClick={handleBack}
                      sx={{ mb: isSmallScreen ? "10px" : "0" }}
                    >
                      {t("Quay lại")}
                    </Button>
                  )}
                  <LoadingButton
                    disableElevation
                    disableRipple
                    sx={{
                      marginLeft: isSmallScreen ? "0" : "auto",
                      width: isSmallScreen ? "100%" : "auto",
                    }}
                    color="success"
                    type="submit"
                    variant="contained"
                    loadingPosition="start"
                    loading={isSubmitting}
                    startIcon={<SaveAsOutlinedIcon />}
                    disabled={isLastStep && !rest.values.hasReadRegulations}
                  >
                    {!isLastStep ? t("Tiếp") : t("Đặt vé")}
                  </LoadingButton>
                </Box>
              </form>
            )}
          </Formik>
        )}
      </Box>
      <Regulation open={showRegulations} onClose={handleCloseRegulations} />
    </Box>
  );
};

export default StepperBooking;
