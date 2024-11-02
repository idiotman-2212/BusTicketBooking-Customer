import { Box, Typography, useTheme, useMediaQuery  } from "@mui/material";
import { format, parse } from "date-fns";
import React from "react";
import CoachModel from "../../SeatModels/CoachModel";
import { tokens } from "../../../../theme";
import { useTranslation } from "react-i18next";

const SeatForm = ({ field, setActiveStep, bookingData, setBookingData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const { bookingDateTime, trip } = bookingData;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Hàm lấy giá cuối cùng sau khi áp dụng mã giảm giá (nếu có)
  const getBookingPriceString = (trip) => {
    let finalPrice = trip.price;
    if (!isNaN(trip?.discount?.amount)) {
      finalPrice -= trip.discount.amount;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(finalPrice); // Format giá cho đẹp
  };

  const bookingDate = format(
    parse(bookingDateTime, "yyyy-MM-dd HH:mm", new Date()),
    "dd/MM/yyyy"
  );

  return (
    <>
      {/* Thông tin tóm tắt về chuyến đi */}
      <Box
        mt="15px"
        textAlign="center"
        bgcolor={colors.primary[400]}
        m={isSmallScreen ? "0 10px" : "0 60px"}
        p="15px"
        borderRadius="20px"
        display="flex"
        flexDirection={isSmallScreen ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        gap={isSmallScreen ? "10px" : "15px"}
        boxShadow={isSmallScreen ? "none" : "0px 4px 15px rgba(0, 128, 0, 0.2)"}
      >

        <Typography component="span" variant="h5">
          {`${trip.source.name} ${
            bookingData.bookingType === "ONEWAY" ? `\u21D2` : `\u21CB`
          } ${trip.destination.name}`}
        </Typography>
        <Typography
          component="span"
          variant="h5"
          color={colors.greenAccent[400]}
        >
          {`\u25CF`}
        </Typography>
        <Typography component="span" variant="h5">
          {format(
            parse(trip.departureDateTime, "yyyy-MM-dd HH:mm", new Date()),
            "HH:mm dd-MM-yyyy"
          )}
        </Typography>
        <Typography
          component="span"
          variant="h5"
          color={colors.greenAccent[400]}
        >
          {`\u25CF`}
        </Typography>
        <Typography component="span" variant="h5">
          {`${trip.coach.name}, ${trip.coach.coachType}`}
        </Typography>
        <Typography
          component="span"
          variant="h5"
          color={colors.greenAccent[400]}
        >
          {`\u25CF`}
        </Typography>
        <Typography component="span" variant="h5">
          {getBookingPriceString(trip)}
        </Typography>
      </Box>

      {/* Chọn ghế */}
      <Box mt="30px">
        <CoachModel
          field={field}
          setActiveStep={setActiveStep}
          bookingData={bookingData}
          setBookingData={setBookingData}
        />
      </Box>
    </>
  );
};

export default SeatForm;
