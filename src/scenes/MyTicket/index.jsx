import ContentPasteSearchOutlinedIcon from "@mui/icons-material/ContentPasteSearchOutlined";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Modal,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { compareAsc, format, isAfter, parse, parseISO } from "date-fns";
import { debounce } from "lodash";
import React, { useEffect, useState, useContext } from "react";
import * as bookingApi from "../../queries/booking/ticketQueries";
import { tokens, ColorModeContext } from "../../theme";
import { APP_CONSTANTS } from "../../utils/appContants";
import { messages } from "../../utils/validationMessages";
import { useTranslation } from "react-i18next";

const getFormattedPaymentDateTime = (paymentDateTime) => {
  return format(
    parse(paymentDateTime, "yyyy-MM-dd HH:mm:ss", new Date()),
    "HH:mm:ss dd/MM/yyyy"
  );
};

const getBookingPrice = (trip) => {
  let finalPrice = trip.price;
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }
  return finalPrice;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const MyTicket = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);
  const [openModal, setOpenModal] = useState(false);
  const [isInValidPhone, setIsInValidPhone] = useState(false);
  const [sortedTickets, setSortedTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(-1);
  const loggedInUsername = localStorage.getItem("loggedInUsername");
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const bookingSearchQuery = useQuery({
    queryKey: ["bookings", "all", "user", loggedInUsername],
    queryFn: () => bookingApi.getAllByUsername(loggedInUsername),
    enabled: loggedInUsername !== "",
  });

  const bookingDetailQuery = useQuery({
    queryKey: ["bookings", selectedTicket],
    queryFn: () => bookingApi.getBooking(selectedTicket),
    enabled: selectedTicket >= 0,
  });

  const sortTickets = (ticketList) => {
    if (!ticketList?.length) return [];

    const compareByDepartureDateTimeAsc = (a, b) => {
      const aDateTime = parseISO(a.trip.departureDateTime); // Chuyển chuỗi thành Date
      const bDateTime = parseISO(b.trip.departureDateTime);
      return compareAsc(aDateTime, bDateTime);
    };

    return [...ticketList].sort(compareByDepartureDateTimeAsc);
  };

  const getPaymentStatusObject = (paymentStatus) => {
    switch (paymentStatus) {
      case "UNPAID":
        return { title: t("Chưa thanh toán"), color: "warning" };
      case "PAID":
        return { title: t("Đã thanh toán"), color: "success" };
      case "CANCEL":
        return { title: t("Đã hủy vé"), color: "error" };
      case "REFUNDED":
        return { title: t("Đã hoàn tiền"), color: "info" };
    }
  };

  const getStatusText = (historyStatus) => {
    if (historyStatus === null) return t("Tạo mới");
    switch (historyStatus) {
      case "UNPAID":
        return t("Chưa thanh toán");
      case "PAID":
        return t("Đã thanh toán");
      case "CANCEL":
        return t("Đã hủy vé");
      case "REFUNDED":
        return t("Đã hoàn tiền");
    }
  };

  // filter and sort booking date desc
  useEffect(() => {
    const newTickets = sortTickets(bookingSearchQuery?.data ?? []);
    setSortedTickets(newTickets);
  }, [bookingSearchQuery.data]);

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district, province } = location;
    return `${address || ""}${ward ? ", " + ward : ""}${
      district ? ", " + district : ""
    }${province?.name ? ", " + province.name : ""}`;
  };
  
  return (
    <Box
      mt="100px"
      display="flex"
      flexDirection="column"
      gap="20px"
      alignItems="center"
      bgcolor={theme.palette.background.default} // Màu nền từ theme
      color={theme.palette.text.secondary} // Màu chữ từ theme
    >
      <Typography variant="h2" fontWeight="bold">
        {t("Vé của bạn")}
      </Typography>
      {bookingSearchQuery?.data ? (
        sortedTickets.length !== 0 ? (
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gap="30px"
            p="50px"
            bgcolor={colors.primary[400]}
            sx={{
              width: "100%",
              position: "relative",
              overflow: "auto",
              maxHeight: 400,
            }}
          >
            {sortedTickets.map((booking) => {
              const { trip, bookingDateTime, seatNumber, paymentStatus } =
                booking;
              return (
                <Card
                  key={booking.id}
                  onClick={() => {
                    setSelectedTicket(booking.id);
                    setOpenModal(!openModal);
                  }}
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gridColumn: "span 6",
                    cursor: "pointer",
                    padding: "0 20px",
                  }}
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        gap: "20px",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography component="span" variant="h6">
                          <span style={{ fontWeight: "bold" }}>
                            {t("Tuyến")}:{" "}
                          </span>
                          {`${trip.source.name}
                           ${`\u21D2`}
                         ${trip.destination.name}`}
                        </Typography>
                        <Typography variant="h6">
                          {" "}
                          <span style={{ fontWeight: "bold" }}>
                            {t("Xe")}:{" "}
                          </span>
                          {trip.coach.coachType}
                        </Typography>
                        <Typography variant="h6">
                          <span style={{ fontWeight: "bold" }}>
                            {t("Ngày đi")}:{" "}
                          </span>{" "}
                          {format(
                            parse(
                              trip.departureDateTime,
                              "yyyy-MM-dd HH:mm",
                              new Date()
                            ),
                            "HH:mm dd-MM-yyyy"
                          )}
                        </Typography>
                        <Typography variant="h6">
                          <span style={{ fontWeight: "bold" }}>
                            {t("Ghế")}:{" "}
                          </span>
                          {seatNumber}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="end" alignItems="end">
                        <Chip
                          label={getPaymentStatusObject(paymentStatus)?.title}
                          color={getPaymentStatusObject(paymentStatus)?.color}
                        />
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              );
            })}
          </Box>
        ) : (
          // no result
          <Box
            p="100px"
            display="flex"
            flexDirection="column"
            gap="10px"
            justifyContent="center"
            alignItems="center"
          >
            <ContentPasteSearchOutlinedIcon
              sx={{
                width: "150px",
                height: "150px",
                color: colors.primary[400],
              }}
            />
            <Typography
              color={colors.primary[400]}
              variant="h2"
              fontWeight="bold"
            >
              {t("Không có kết quả")}
            </Typography>
          </Box>
        )
      ) : undefined}

      {/* Ticket detail modal */}
      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor: colors.primary[400],
          },
        }}
        open={openModal}
        onClose={() => setOpenModal(!openModal)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* ticket info */}
          <Box display="flex" alignItems="center">
            {bookingDetailQuery?.data && (
              <>
                <Box>
                  <Typography mb="40px" variant="h3" fontWeight="bold">
                    {t("THÔNG TIN VÉ ĐẶT")}
                  </Typography>
                  <Typography component="span" variant="h6">
                    <span style={{ fontWeight: "bold" }}>{t("Tuyến")}: </span>
                    {`${bookingDetailQuery.data.trip.source.name}
                           ${`\u21D2`}
                         ${bookingDetailQuery.data.trip.destination.name}`}
                  </Typography>
                  <Typography variant="h6">
                    {" "}
                    <span style={{ fontWeight: "bold" }}>{t("Xe")}: </span>
                    {`${bookingDetailQuery.data.trip.coach.name} ${bookingDetailQuery.data.trip.coach.coachType}`}
                  </Typography>
                  <Typography variant="h6">
                    <span style={{ fontWeight: "bold" }}>
                      {t("Ngày giờ đi")}:{" "}
                    </span>{" "}
                    {format(
                      parse(
                        bookingDetailQuery.data.trip.departureDateTime,
                        "yyyy-MM-dd HH:mm",
                        new Date()
                      ),
                      "HH:mm dd-MM-yyyy"
                    )}
                  </Typography>
                  <Typography variant="h6">
                    <span style={{ fontWeight: "bold" }}>{t("Giá vé")}: </span>
                    {`${formatCurrency(
                      getBookingPrice(bookingDetailQuery.data.trip)
                    )}`}
                  </Typography>
                  <Typography variant="h6">
                    <span style={{ fontWeight: "bold" }}>{t("Ghế")}: </span>
                    {bookingDetailQuery.data.seatNumber}
                  </Typography>
                </Box>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(4, 1fr)"
                  gap="15px"
                >
                  <Divider sx={{ gridColumn: "span 4" }}>
                    {t("Thông tin hành khách")}
                  </Divider>
                  <TextField
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    type="text"
                    label={t("Họ")}
                    value={bookingDetailQuery.data.custFirstName}
                    name="custFirstName"
                    InputProps={{
                      readOnly: true,
                    }}
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
                    value={bookingDetailQuery.data.custLastName}
                    name="custLastName"
                    InputProps={{
                      readOnly: true,
                    }}
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
                    value={bookingDetailQuery.data.phone}
                    name="phone"
                    InputProps={{
                      readOnly: true,
                    }}
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
                    label={t("Email")}
                    value={bookingDetailQuery.data.email ?? "Không có"}
                    name="email"
                    InputProps={{
                      readOnly: true,
                    }}
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
                    label={t("Địa chỉ đón")}
                    value={formatLocation(bookingDetailQuery.data.trip.pickUpLocation)}
                    name="pickUpLocation"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      gridColumn: "span 4",
                    }}
                  />
                  <TextField
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    type="text"
                    label={t("Địa chỉ trả")}
                    value={formatLocation(bookingDetailQuery.data.trip.dropOffLocation)}
                    name="dropOffLocation"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      gridColumn: "span 4",
                    }}
                  />
                  <Divider sx={{ gridColumn: "span 4", mt: "20px" }}>
                    {t("Thông tin thanh toán")}
                  </Divider>
                  <TextField
                    color="warning"
                    size="small"
                    fullWidth
                    variant="outlined"
                    type="text"
                    label={t("Phương thức thanh toán")}
                    value={
                      bookingDetailQuery.data.paymentMethod === "CASH"
                        ? "Tiền mặt"
                        : "Thẻ visa"
                    }
                    name="paymentMethod"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      gridColumn: "span 2",
                    }}
                  />
                  <TextField
                    color={
                      getPaymentStatusObject(
                        bookingDetailQuery.data.paymentStatus
                      )?.color
                    }
                    size="small"
                    fullWidth
                    variant="outlined"
                    type="text"
                    label={t("Trạng thái thanh toán")}
                    value={
                      getPaymentStatusObject(
                        bookingDetailQuery.data.paymentStatus
                      )?.title
                    }
                    name="paymentStatus"
                    InputProps={{
                      readOnly: true,
                    }}
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
                    label={t("Ngày thanh toán")}
                    value={getFormattedPaymentDateTime(
                      bookingDetailQuery.data.paymentDateTime
                    )}
                    name="paymentDateTime"
                    InputProps={{
                      readOnly: true,
                    }}
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
                    label={t("Tổng tiền thanh toán")}
                    value={formatCurrency(bookingDetailQuery.data.totalPayment)}
                    name="totalPayment"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      gridColumn: "span 2",
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
          <Divider sx={{ width: "100%" }}>{t("Lịch sử thanh toán")}</Divider>
          {/* payment history */}
          <Box>
            {bookingDetailQuery?.data && (
              <Box maxHeight="150px" overflow="auto">
                {bookingDetailQuery.data.paymentHistories
                  .toReversed()
                  .map((history, index) => {
                    const { oldStatus, newStatus, statusChangeDateTime } =
                      history;
                    return (
                      <Box p="5px" textAlign="center" key={index}>
                        <Typography>{`${format(
                          parse(
                            statusChangeDateTime,
                            "yyyy-MM-dd HH:mm:ss",
                            new Date()
                          ),
                          "HH:mm:ss dd/MM/yyyy"
                        )}`}</Typography>
                        <Typography mt="4px" fontWeight="bold" variant="h5">
                          {`${getStatusText(oldStatus)} \u21D2 ${getStatusText(
                            newStatus
                          )}`}
                        </Typography>
                      </Box>
                    );
                  })}
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MyTicket;
