import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Container,
} from "@mui/material";
import { Check, Error, AccessTime } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as bookingApi from "../../queries/booking/ticketQueries";

const RefundConfirmation = () => {
  const { bookingId } = useParams();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Đang xử lý hoàn tiền...");

  // Lấy chi tiết vé đặt
  const bookingDetailQuery = useQuery({
    queryKey: ["bookings", bookingId], // Dùng bookingId thay vì selectedTicket
    queryFn: () => bookingApi.getBooking(bookingId),
    enabled: !!bookingId, // Chỉ thực hiện query khi có bookingId
  });

  useEffect(() => {
    const confirmRefund = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/bookings/refund/confirm/${bookingId}`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          setStatus("success");
          setMessage("Xác nhận hoàn tiền thành công.");
        } else {
          const errorData = await response.json();
          setStatus("error");
          setMessage(errorData.message || "Không thể xác nhận hoàn tiền.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Đã xảy ra lỗi không mong muốn.");
      }
    };

    if (bookingId) {
      confirmRefund(); // Gọi confirmRefund chỉ khi có bookingId
    }
  }, [bookingId]);

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <CircularProgress size={60} />;
      case "success":
        return <Check sx={{ fontSize: 60, color: "success.main" }} />;
      case "error":
        return <Error sx={{ fontSize: 60, color: "error.main" }} />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case "processing":
        return "primary.lightest";
      case "success":
        return "success.lightest";
      case "error":
        return "error.lightest";
      default:
        return "grey.100";
    }
  };

  // Kiểm tra trạng thái loading của việc lấy thông tin booking
  if (bookingDetailQuery.isLoading) {
    return <CircularProgress />;
  }

  // Kiểm tra lỗi khi lấy thông tin booking
  if (bookingDetailQuery.isError) {
    return (
      <Alert severity="error">
        <AlertTitle>Lỗi</AlertTitle>
        Không thể lấy thông tin booking.
      </Alert>
    );
  }

  const booking = bookingDetailQuery.data;

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: "100%",
          backgroundColor: "background.paper",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 3,
              backgroundColor: getBackgroundColor(),
              borderRadius: 1,
            }}
          >
            {getStatusIcon()}

            <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
              {status === "processing"
                ? "Đang xử lý"
                : status === "success"
                ? "Thành công!"
                : "Lỗi"}
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
              {message}
            </Typography>

            {status === "success" && (
              <Alert
                severity="success"
                sx={{ width: "100%", mt: 2 }}
                icon={<AccessTime />}
              >
                <AlertTitle>Mã đặt vé: {bookingId}</AlertTitle>
                {/* Hiển thị thông tin vé đặt */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Tên khách hàng:</strong> {booking.custFirstName} {booking.custLastName}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Số điện thoại:</strong> {booking.phone}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {booking.email}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Ngày đặt vé:</strong> {new Date(booking.bookingDateTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Loại vé:</strong> {booking.bookingType}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Tổng giá trị thanh toán:</strong>{" "}
                    {booking.totalPayment
                      ? booking.totalPayment.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      : "Chưa thanh toán"}
                  </Typography>
                </Box>
              </Alert>
            )}

            {status === "error" && (
              <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                <AlertTitle>Đã xảy ra lỗi</AlertTitle>
                Vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi để được giúp đỡ.
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RefundConfirmation;
