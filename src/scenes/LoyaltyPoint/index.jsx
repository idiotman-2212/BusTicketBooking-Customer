import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  Box,
  CircularProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Modal,
  TextField,
  IconButton,
  Skeleton,
  Stack,
  Paper,
  useTheme,
  Container,
  Button,
} from "@mui/material";
import { getLoyaltyTransactions } from "../../queries/loyalty/loyaltyQueries";
import { useQuery } from "@tanstack/react-query";
import PersonIcon from "@mui/icons-material/Person";
import CommuteOutlinedIcon from "@mui/icons-material/CommuteOutlined";
import { parseISO, format } from "date-fns";
import { tokens, ColorModeContext } from "../../theme";
import * as userApi from "../../queries/user/userQueries";
import * as tripApi from "../../queries/trip/tripQueries";
import * as ticketApi from "../../queries/booking/ticketQueries";
import CustomToolTip from "../../global/CustomToolTip";
import { getLoyaltyPoints } from "../../queries/loyalty/loyaltyQueries";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const getBookingDateFormat = (bookingDateTime) => {
  return format(
    parseISO(bookingDateTime), // Sử dụng parseISO thay vì parse
    "dd/MM/yyyy"
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const LoyaltyPoint = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const [openUserModal, setOpenUserModal] = useState(false);
  const [openTripModal, setOpenTripModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedRow, setSelectedRow] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoyaltyTransactions(pageIndex, pageSize);
      // Sắp xếp các giao dịch theo thứ tự giảm dần của ngày giao dịch
      const sortedTransactions = data.dataList.sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
      );
      setTransactions(sortedTransactions);
      setTotalPages(data.pageCount);
    } catch (error) {
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [pageIndex, pageSize, fetchTransactions]);

  const userQuery = useQuery({
    queryKey: ["user", selectedUser],
    queryFn: () => userApi.getUser(selectedUser),
    enabled: !!selectedUser,
  });

  const tripQuery = useQuery({
    queryKey: ["trip", selectedTrip],
    queryFn: () => tripApi.getTrip(selectedTrip),
    enabled: !!selectedTrip,
  });

  const handlePageChange = (event, newPage) => {
    setPageIndex(newPage - 1);
  };

  const loyaltyPointsQuery = useQuery({
    queryKey: ["loyaltyPoints"],
    queryFn: getLoyaltyPoints,
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={theme.palette.background.default} // Màu nền từ theme
        color={theme.palette.text.primary} // Màu chữ từ theme
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={theme.palette.background.default} // Màu nền từ theme
        color={theme.palette.text.primary} // Màu chữ từ theme
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      p={3}
      bgcolor={theme.palette.background.default} // Màu nền từ theme
      color={theme.palette.text.primary} // Màu chữ từ theme
    >
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center"> {/* Sử dụng Flexbox */}
        <Box>
          <Typography
            variant="h4"
            color={colors.greenAccent[400]}
            fontWeight="bold"
            marginBottom={1} // Thay đổi để tạo khoảng cách dưới tiêu đề
          >
            {t("Số Xu Hiện Có")}:{" "}
            <strong>
              {formatCurrency(loyaltyPointsQuery.data.loyaltyPoints)}
            </strong>
          </Typography>
          <Typography
            variant="h5"
            color={colors.grey[100]}
          >
            {t("Lịch Sử Giao Dịch")}
          </Typography>
        </Box>

        {/* Nút bấm chuyển đến giao diện Report */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/report")} // Chuyển hướng đến trang Report
          sx={{
            padding: "10px 20px", // Điều chỉnh padding của nút
            fontSize: "16px", // Thay đổi kích thước chữ cho nút
            fontWeight: "bold", // Để chữ đậm hơn
            borderRadius: "8px", // Tạo góc bo tròn cho nút
          }}
        >
          {t("Thống Kê")} {/* Sử dụng hàm dịch để hiển thị văn bản */}
        </Button>
      </Box>
    </Paper>

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{ borderRadius: "12px" }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "background.default",
                color: "text.primary",
              }}
            >
              <TableCell
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: colors.grey[100],
                }}
              >
                {t("Người Dùng")}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: colors.grey[100],
                }}
              >
                {t("Số Xu")}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: colors.grey[100],
                }}
              >
                {t("Ngày Giao Dịch")}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: colors.grey[100],
                }}
              >
                {t("Loại Giao Dịch")}
              </TableCell>

              <TableCell
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: colors.grey[100],
                }}
              >
                {t("Chuyến Đi")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t("Không có giao dịch nào")}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.transactionId}>
                  {/* <TableCell>{transaction.bookingId}</TableCell> */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap="8px">
                      <Typography>{transaction.username}</Typography>
                      <CustomToolTip
                        title={t("Chi tiết người dùng")}
                        placement="top"
                      >
                        <IconButton
                          onClick={() => {
                            setSelectedUser(transaction.username);
                            setOpenUserModal(true);
                          }}
                        >
                          <PersonIcon />
                        </IconButton>
                      </CustomToolTip>
                    </Box>
                  </TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    {transaction.transactionDate
                      ? format(
                          parseISO(
                            transaction.transactionDate,
                            "yyyy-MM-dd HH:mm:ss",
                            new Date()
                          ),
                          "HH:mm dd-MM-yyyy"
                        )
                      : t("Không có thông tin ngày giao dịch")}
                  </TableCell>

                  <TableCell
                    sx={{
                      color:
                        transaction.transactionType === "EARN"
                          ? "green"
                          : "orange", // Màu xanh cho Nhận Điểm và màu vàng cho Sử Dụng Điểm
                      fontWeight: "bold", // Để chữ đậm dễ nhận biết hơn
                    }}
                  >
                    {transaction.transactionType === "EARN"
                      ? t("Nhận Điểm")
                      : t("Sử Dụng Điểm")}
                  </TableCell>

                  <TableCell>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start" // This ensures the content starts from the left
                      gap="8px" // Adjust the spacing between text and icon
                    >
                      {/* Hiển thị điểm nguồn và điểm đích */}
                      <Typography fontStyle="italic">
                        {transaction.source && transaction.destination
                          ? `${transaction.source} -> ${transaction.destination}`
                          : "Chưa có thông tin chuyến đi"}
                      </Typography>

                      {/* Icon chuyến đi */}
                      <CustomToolTip
                        title={t("Chi tiết chuyến đi")}
                        placement="top"
                      >
                        <IconButton
                          onClick={() => {
                            if (transaction.tripId) {
                              setSelectedTrip(transaction.tripId);
                              setOpenTripModal(true);
                            } else {
                              console.error(
                                "Thông tin chuyến đi không có trong giao dịch"
                              );
                            }
                          }}
                          sx={{
                            padding: 0, // Remove extra padding from the icon
                            marginLeft: "8px", // Optional: Add a margin to separate icon from text
                          }}
                        >
                          <CommuteOutlinedIcon
                            fontSize="small" // Adjust the icon size for better alignment
                          />
                        </IconButton>
                      </CustomToolTip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="center" alignItems="center">
        <Pagination
          page={pageIndex + 1}
          count={totalPages}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* User Detail Modal */}
      <Modal
        open={openUserModal}
        onClose={() => setOpenUserModal(false)}
        aria-labelledby="user-modal-title"
        aria-describedby="user-modal-description"
      >
        <Box sx={modalStyle} textAlign="center" marginBottom="30px">
          <Typography
            id="user-modal-title"
            variant="h4"
            component="h2"
            textAlign="center"
            fontWeight="bold"
            marginBottom="20px"
          >
            {t("Chi tiết người dùng")}
          </Typography>
          {userQuery.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Stack>
          ) : (
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Tên đăng nhập")}
                name="username"
                value={userQuery?.data?.username}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label="Email"
                name="email"
                value={userQuery?.data?.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Số điện thoại")}
                name="phone"
                value={userQuery?.data?.phone}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Họ và Tên")}
                name="fullName"
                value={`${userQuery?.data?.firstName} ${userQuery?.data?.lastName}`}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
          )}
        </Box>
      </Modal>

      {/* Trip Detail Modal */}
      <Modal
        open={openTripModal}
        onClose={() => setOpenTripModal(false)}
        aria-labelledby="trip-modal-title"
        aria-describedby="trip-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="trip-modal-title"
            variant="h4"
            component="h2"
            textAlign="center"
            fontWeight="bold"
            marginBottom="20px"
          >
            {t("Chi tiết chuyến đi")}
          </Typography>
          {tripQuery.isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Stack>
          ) : (
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Từ")}
                name="from"
                value={tripQuery?.data?.source.name}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Đến")}
                name="to"
                value={tripQuery?.data?.destination.name}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Thời gian khởi hành")}
                name="bookingDateTime"
                value={format(
                  parseISO(
                    tripQuery?.data.departureDateTime,
                    "yyyy-MM-dd HH:mm",
                    new Date()
                  ),
                  "HH:mm dd-MM-yyyy"
                )}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                type="text"
                label={t("Giá")}
                name="price"
                value={tripQuery?.data?.price}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default LoyaltyPoint;
