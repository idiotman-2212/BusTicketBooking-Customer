import SquareIcon from "@mui/icons-material/Square";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from "react";
import Bed_Limousine_Seat_Data from "../SeatModels/Bed_Limousine_Seat_Data";
import SeatModel from "../SeatModels/SeatModel";
import * as bookingApi from "../../../queries/booking/ticketQueries";
import { tokens } from "../../../theme";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../../theme";

const MAX_SEAT_SELECT = 5;

// Hàm lấy giá cuối cùng của chuyến đi (có áp dụng giảm giá nếu có)
const getBookingPrice = (trip) => {
  let finalPrice = trip.price;
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }
  return finalPrice;
};

const CoachModel = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { field, setActiveStep, bookingData, setBookingData } = props;
  const { values, setFieldValue } = field;
  const [selectedSeats, setSelectedSeats] = useState(bookingData.seatNumber);
  const [numberOfSelectedSeats, setNumberOfSelectedSeats] = useState(
    bookingData.seatNumber.length
  );
  const coachType = bookingData.trip.coach.coachType;
  const capacity = bookingData.trip.coach.capacity; // Sức chứa động của xe
  const price = getBookingPrice(bookingData.trip);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Thêm bộ đếm giờ
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    if (timeLeft === 0) {
      clearInterval(timerId);
      releaseSeats({ seatNumber: selectedSeats, trip: bookingData.trip });
      alert("Thời gian giữ ghế đã hết. Quay lại chọn chuyến đi.");
      navigate("/booking");
    }

    return () => clearInterval(timerId);
  }, [timeLeft, selectedSeats, bookingData.trip, navigate]);

  // Lấy dữ liệu ghế ngồi động từ Bed_Limousine_Seat_Data theo loại xe và sức chứa
  const seatData = useMemo(() => {
    if (Bed_Limousine_Seat_Data[coachType]) {
      return Bed_Limousine_Seat_Data[coachType](capacity);
    }
    return {};
  }, [coachType, capacity]);

  // Lấy thông tin ghế đã đặt
  const seatBookingQuery = useQuery({
    queryKey: ["bookings", bookingData.trip.id, bookingData.bookingDateTime],
    queryFn: () =>
      bookingApi.getSeatBooking(
        bookingData.trip.id,
        bookingData.bookingDateTime
      ),
  });

  // Lưu ghế đã đặt vào danh sách ghế đã đặt
  const handleSeatOrdered = (orderedBookings) => {
    const orderedSeats = [];
    if (orderedBookings?.length === 0) return orderedSeats;
    orderedBookings.forEach((ordered) => {
      orderedSeats.push(ordered.seatNumber);
    });
    return orderedSeats;
  };

  const orderedSeats = handleSeatOrdered(seatBookingQuery?.data ?? []);

  // Cập nhật trạng thái khi ghế được chọn hoặc bỏ chọn
  const handleSeatChoose = useCallback(
    (seatNumber, STAIR, isSelected, isOrdered) => {
      if (isOrdered) return; // Nếu ghế đã đặt thì không thể chọn
      if (isSelected && numberOfSelectedSeats === MAX_SEAT_SELECT) return; // Giới hạn số ghế

      let newSelectedSeats = [...selectedSeats];

      if (isSelected) {
        newSelectedSeats.push(seatNumber);
        setSelectedSeats(newSelectedSeats);
        setNumberOfSelectedSeats(numberOfSelectedSeats + 1);
      } else {
        newSelectedSeats = newSelectedSeats.filter(
          (seat) => seat !== seatNumber
        );
        setSelectedSeats(newSelectedSeats);
        setNumberOfSelectedSeats(numberOfSelectedSeats - 1);
      }

      // Cập nhật trạng thái ghế trong seatData
      const newValues = {
        ...seatData,
        [STAIR]: {
          ...seatData[STAIR],
          [seatNumber]: {
            ...seatData[STAIR][seatNumber],
            choose: isSelected,
          },
        },
      };

      setFieldValue("seatNumber", newSelectedSeats);
      setFieldValue("totalPayment", newSelectedSeats.length * price);
    },
    [seatData, selectedSeats, numberOfSelectedSeats, setFieldValue, price]
  );

  const memoizedHandleSeatChoose = useMemo(
    () => handleSeatChoose,
    [handleSeatChoose]
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Box
      position="relative"
      display="grid"
      gridTemplateColumns={isSmallScreen ? "1fr" : "repeat(12, 1fr)"}
      gap="10px"
      p={isSmallScreen ? "20px" : "30px"}
      bgcolor={colors.primary[400]}
      borderRadius="10px"
      boxShadow={isSmallScreen ? "none" : "0px 4px 10px rgba(0, 0, 0, 0.1)"}
    >
      {/* Render tip trạng thái ghế */}
      <Box
        gridColumn={isSmallScreen ? "span 12" : "span 3"}
        display="flex"
        justifyContent="center"
        flexDirection={isSmallScreen ? "row" : "column"}
        alignItems="center"
        gap="15px"
      >
        <Box textAlign="center">
          <SquareIcon
            sx={{
              borderRadius: "20px",
              width: "25px",
              height: "25px",
              color: "#000",
            }}
          />
          <Typography fontWeight="bold">{t("Đã đặt")}</Typography>
        </Box>
        <Box textAlign="center">
          <SquareIcon
            sx={{
              borderRadius: "20px",
              width: "25px",
              height: "25px",
              color: "#979797",
            }}
          />
          <Typography fontWeight="bold">{t("Trống")}</Typography>
        </Box>
        <Box textAlign="center">
          <SquareIcon
            sx={{
              borderRadius: "20px",
              width: "25px",
              height: "25px",
              color: "#ff4138",
            }}
          />
          <Typography fontWeight="bold">{t("Đang chọn")}</Typography>
        </Box>
      </Box>

      {/* Render ghế ngồi */}
      <Box
        gridColumn={isSmallScreen ? "span 12" : "span 6"}
        display="flex"
        flexDirection={isSmallScreen ? "column" : "row"}
        alignItems="center"
        justifyContent="space-evenly"
        gap={isSmallScreen ? "20px" : "50px"}
      >
        {Object.keys(seatData).map((stair, index) => (
          <Box
            key={stair}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              // mb={2}
              color={colors.greenAccent[400]}
            >
              {stair === "DOWN_STAIR"
                ? t("Tầng dưới")
                : stair === "UP_STAIR"
                ? t("Tầng trên")
                : ""}
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(3, minmax(0, 1fr))">
              {Object.entries(seatData[stair]).map(([seatNumber, seat]) => (
                <SeatModel
                  key={seatNumber}
                  handleSeatChoose={memoizedHandleSeatChoose}
                  seat={seat}
                  selectedSeats={selectedSeats}
                  orderedSeats={orderedSeats}
                  coachType={coachType}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Render thông tin bổ sung */}
      <Box
        gridColumn={isSmallScreen ? "span 12" : "span 3"}
        gap="20px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Box gridColumn="span 12" textAlign="center" mb="20px">
          <Typography variant="h6" color="error">
            {`${t("Thời gian giữ ghế còn lại")}: ${Math.floor(timeLeft / 60)}:${
              timeLeft % 60 < 10 ? "0" : ""
            }${timeLeft % 60}`}
          </Typography>
        </Box>

        <Box>
          <Typography variant="h5">
            <span style={{ fontWeight: "bold" }}>
              {t("Đã chọn")}: {numberOfSelectedSeats} / {MAX_SEAT_SELECT}{" "}
              {t("chỗ")}
            </span>
          </Typography>
          <Typography variant="h5">
            <span style={{ fontWeight: "bold" }}>
              {t("Tổng tiền")}: {formatCurrency(price * numberOfSelectedSeats)}
            </span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(CoachModel);
