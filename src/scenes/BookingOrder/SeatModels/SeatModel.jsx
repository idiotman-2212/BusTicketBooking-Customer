import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, Typography, useMediaQuery, useTheme  } from "@mui/material";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { tokens } from "../../../theme";

const SeatModel = (props) => {
  const { seat, handleSeatChoose, coachType, selectedSeats, orderedSeats } = props;
  const { name, choose } = seat;
  const isOrdered = orderedSeats.includes(name);
  const isChosen = selectedSeats.includes(name);
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Màu sắc ghế dựa trên trạng thái
  const getSeatStateColor = () => {
    if (isOrdered) return "#000"; // Màu đen cho ghế đã đặt
    if (isChosen) return "#ff4138"; // Màu đỏ cho ghế đang chọn
    return "#979797"; // Màu xám cho ghế trống
  };

  return (
    <Box
      onClick={() => {
        if (!isOrdered) {
          handleSeatChoose(
            name,
            name.startsWith("A") ? "DOWN_STAIR" : "UP_STAIR",
            !isChosen,
            isOrdered
          );
        }
      }}
      component="div"
      position="relative"
      display={
        (name === "A18" || name === "B18") &&
        (coachType === "LIMOUSINE" || coachType === "BED")
          ? "none"
          : "initial"
      }
      sx={{
        cursor: isOrdered ? "not-allowed" : "pointer",
        color: getSeatStateColor(),
        gridColumn:
          (name === "A1" || name === "B1") &&
          (coachType === "LIMOUSINE" || coachType === "BED")
            ? "span 2"
            : undefined,
      }}
      width={isSmallScreen ? "50px" : "60px"}
      height={isSmallScreen ? "50px" : "60px"}
      alignItems="center"
      justifyContent="center"
    >
      <InboxOutlinedIcon sx={{ width: "100%", height: "100%" }} />
      <Typography
        position="absolute"
        top="40%"
        left="50%"
        fontWeight="bold"
        fontSize={isSmallScreen ? "0.8rem" : "1rem"}
        sx={{
          transform: "translate(-50%, -50%)",
        }}
      >
        {name}
      </Typography>
    </Box>
  );
};

export default memo(SeatModel);
