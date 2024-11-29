import React, { useState, useEffect } from "react";
import {
  getUnreadNotifications,
  getRecentNotifications,
  getAllNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  deleteNotification,
} from "../../queries/notification/notificationQueries";
import {
  submitReview,
  getReviewByTripId,
} from "../../queries/review/reviewQueries";
import * as reviewQueries from "../../queries/review/reviewQueries";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Box,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  TextField,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const Notification = () => {
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openRecentModal, setOpenRecentModal] = useState(false);
  const [openAllModal, setOpenAllModal] = useState(false);
  const [loadingUnread, setLoadingUnread] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [tripIdForReview, setTripIdForReview] = useState(null);
  const [driverRating, setDriverRating] = useState(0);
  const [coachRating, setCoachRating] = useState(0);
  const [tripRating, setTripRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    fetchUnreadNotifications(); // Lấy thông báo chưa đọc
    fetchUnreadCount(); // Lấy số lượng thông báo chưa đọc
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      setLoadingUnread(true);
      const unreadNotificationsData = await getUnreadNotifications();
      // Lọc ra các thông báo chưa đọc
      const filteredNotifications = unreadNotificationsData.filter(
        (n) => !n.isRead
      );
      setUnreadNotifications(filteredNotifications); // Cập nhật danh sách thông báo chưa đọc
    } catch (error) {
      console.error("Error fetching unread notifications", error);
    } finally {
      setLoadingUnread(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count); // Cập nhật số lượng thông báo chưa đọc
    } catch (error) {
      console.error("Error fetching unread notification count", error);
    }
  };

  const handleViewRecentClick = async () => {
    try {
      setLoadingRecent(true);
      const recentNotificationsData = await getRecentNotifications();
      setRecentNotifications(recentNotificationsData); // Cập nhật danh sách thông báo gần đây
      setOpenRecentModal(true); // Mở modal thông báo gần đây
    } catch (error) {
      console.error("Error fetching recent notifications", error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleViewAllClick = async () => {
    try {
      setLoadingAll(true);
      const allNotificationsData = await getAllNotifications();
      setAllNotifications(allNotificationsData); // Cập nhật danh sách tất cả thông báo
      setOpenAllModal(true); // Mở modal tất cả thông báo
    } catch (error) {
      console.error("Error fetching all notifications", error);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id); // Đánh dấu thông báo là đã đọc
      setUnreadCount((prevCount) => Math.max(prevCount - 1, 0)); // Giảm số lượng thông báo chưa đọc
      setUnreadNotifications((prev) =>
        prev.filter((n) => n.id !== notification.id)
      ); // Cập nhật danh sách thông báo chưa đọc
      setSelectedNotification(notification); // Lưu thông báo đã chọn
      setOpenDetailModal(true); // Mở modal chi tiết thông báo
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId); // Xóa thông báo
      setRecentNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      ); // Cập nhật danh sách thông báo gần đây
      setAllNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      ); // Cập nhật danh sách tất cả thông báo
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  const handleCloseRecentModal = () => {
    setOpenRecentModal(false); // Đóng modal thông báo gần đây
  };

  const handleCloseAllModal = () => {
    setOpenAllModal(false); // Đóng modal tất cả thông báo
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false); // Đóng modal chi tiết thông báo
    setSelectedNotification(null); // Đặt lại thông báo đã chọn
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget); // Mở menu thông báo
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Đóng menu thông báo
  };

  const handleTripReview = async (tripId) => {
    console.log("Trip ID for review: ", tripId); // Kiểm tra giá trị tripId
    setTripIdForReview(tripId);

    try {
      // Kiểm tra xem người dùng đã đánh giá chuyến đi chưa
      const hasReviewed = await reviewQueries.getReviewByTripIdAndUsername(
        tripId,
        localStorage.getItem("loggedInUsername")
      );

      if (hasReviewed) {
        alert("Bạn đã đánh giá chuyến đi này rồi.");
        return; // Không hiển thị form đánh giá nữa
      }

      setDriverRating(5);
      setCoachRating(5);
      setTripRating(5);
      // Mở modal đánh giá chuyến đi
      setOpenReviewModal(true);
    } catch (error) {
      console.error("Error checking review status:", error);
    }
  };

  const handleSubmitReview = async () => {
    const username = localStorage.getItem("loggedInUsername");
    const tripId = tripIdForReview;

    if (!tripId || !username) {
      alert("Vui lòng kiểm tra lại thông tin chuyến đi và đăng nhập.");
      return;
    }

    const reviewData = {
      tripId: tripId,
      username: username,
      driverRating,
      coachRating,
      tripRating,
      comment,
    };

    console.log("Review Data to be submitted:", reviewData); // Debug dữ liệu trước khi submit

    try {
      await submitReview(reviewData); // Gửi đánh giá đến backend
      alert(t("Review submitted successfully!"));
      setOpenReviewModal(false);
      // Reset các giá trị đánh giá
      setDriverRating(0);
      setCoachRating(0);
      setTripRating(0);
      setComment("");
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.message === "You have already reviewed this trip."
      ) {
        alert("Bạn đã đánh giá chuyến đi này rồi.");
      } else {
        alert(t("Failed to submit review."));
      }
      console.error("Error submitting review", error);
    }
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <Badge
          badgeContent={unreadCount > 0 ? unreadCount : null}
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: "350px",
          },
        }}
      >
        {loadingUnread ? (
          <CircularProgress />
        ) : unreadNotifications.length > 0 ? (
          unreadNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemText
                primary={
                  <Typography variant="body1" style={{ fontWeight: 500 }}>
                    {notification.title || t("Không có tiêu đề")}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="textSecondary">
                    {new Date(notification.sendDateTime).toLocaleString()}
                  </Typography>
                }
              />
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography fontSize="13px" fontWeight="bold" variant="body2">
              {t("Không có thông báo mới")}
            </Typography>
          </MenuItem>
        )}
        <Divider />
        <Box>
          <MenuItem onClick={handleViewRecentClick}>
            <Button variant="outlined" color="secondary">
              {t("Thông báo gần đây")}
            </Button>
          </MenuItem>
          <MenuItem onClick={handleViewAllClick}>
            <Button variant="outlined" color="secondary">
              {t("Tất cả thông báo")}
            </Button>
          </MenuItem>
        </Box>
      </Menu>

      {/* Dialog for recent notifications */}
      <Dialog
        open={openRecentModal}
        onClose={handleCloseRecentModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          style={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white,
          }}
        >
          {t("Thông báo gần đây")}
        </DialogTitle>
        <DialogContent>
          {loadingRecent ? (
            <CircularProgress />
          ) : recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <Card
                key={notification.id}
                style={{
                  width: "100%",
                  marginBottom: theme.spacing(2),
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: theme.spacing(2),
                  boxShadow: theme.shadows[3],
                  transition: "transform 0.3s ease",
                  transform: "scale(1)",
                  "&:hover": {
                    transform: "scale(1.03)",
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <CardHeader
                  title={
                    <Typography
                      variant="subtitle1"
                      fontSize="13px"
                      style={{ fontWeight: "bold" }}
                    >
                      {notification.title || t("Không có tiêu đề")}
                    </Typography>
                  }
                  subheader={
                    <Typography fontSize="13px" variant="caption">
                      {new Date(notification.sendDateTime).toLocaleString()}
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    fontSize="13px"
                    style={{ color: theme.palette.text.primary }}
                  >
                    {notification.message}
                    {/* Nút đánh giá nếu là thông báo hoàn thành chuyến đi */}
                    {notification.title === "THÔNG BÁO HOÀN THÀNH CHUYẾN ĐI" && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleTripReview(notification.tripId)}
                      >
                        {t("Đánh giá chuyến đi")}
                      </Button>
                    )}
                  </Typography>
                  <IconButton
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>{t("Không tìm thấy thông báo nào")}</Typography>
          )}
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            display: "flex",
            justifyContent: "center",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={handleCloseRecentModal}
            style={{ fontWeight: "bold" }}
            variant="contained"
            color="error"
          >
            {t("Đóng")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for all notifications */}
      <Dialog
        open={openAllModal}
        onClose={handleCloseAllModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          style={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white,
          }}
        >
          {t("Tất cả thông báo")}
        </DialogTitle>
        <DialogContent>
          {loadingAll ? (
            <CircularProgress />
          ) : allNotifications.length > 0 ? (
            allNotifications.map((notification) => (
              <Card
                key={notification.id}
                style={{
                  width: "100%",
                  marginBottom: theme.spacing(2),
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: theme.spacing(2),
                  boxShadow: theme.shadows[3],
                  transition: "transform 0.3s ease",
                  transform: "scale(1)",
                  "&:hover": {
                    transform: "scale(1.03)",
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <CardHeader
                  title={
                    <Typography
                      variant="subtitle1"
                      fontSize="13px"
                      style={{ fontWeight: "bold" }}
                    >
                      {notification.title || t("Không có tiêu đề")}
                    </Typography>
                  }
                  subheader={
                    <Typography fontSize="13px" variant="caption">
                      {new Date(notification.sendDateTime).toLocaleString()}
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    fontSize="13px"
                    style={{ color: theme.palette.text.primary }}
                  >
                    {notification.message}
                    {/* Nút đánh giá nếu là thông báo hoàn thành chuyến đi */}
                    {notification.title === "THÔNG BÁO HOÀN THÀNH CHUYẾN ĐI" && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleTripReview(notification.tripId)}
                      >
                        {t("Đánh giá chuyến đi")}
                      </Button>
                    )}
                  </Typography>
                  <IconButton
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>{t("Không tìm thấy thông báo nào")}</Typography>
          )}
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            display: "flex",
            justifyContent: "center",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={handleCloseAllModal}
            style={{ fontWeight: "bold" }}
            variant="contained"
            color="error"
          >
            {t("Đóng")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chi tiết thông báo */}
      <Dialog
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedNotification?.title || t("Không có tiêu đề")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {selectedNotification?.message}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {new Date(selectedNotification?.sendDateTime).toLocaleString()}
          </Typography>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            display: "flex",
            justifyContent: "center",
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            onClick={handleCloseDetailModal}
            variant="contained"
            color="error"
          >
            {t("Đóng")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal đánh giá chuyến đi */}
      <Dialog
        open={openReviewModal}
        onClose={() => setOpenReviewModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          textAlign="center"
          variant="h4"
          sx={{ fontWeight: "bold" }}
        >
          {t("Đánh giá chuyến đi của bạn")}
        </DialogTitle>
        <DialogContent>
          <Card variant="outlined" sx={{ padding: 2 }}>
            <CardContent>
              {/* Đánh giá lái xe */}
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {t("Xếp hạng tài xế")}
              </Typography>
              <Box display="flex" justifyContent="center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton key={star} onClick={() => setDriverRating(star)}>
                    {star <= driverRating ? (
                      <StarIcon sx={{ color: "#FFD700" }} />
                    ) : (
                      <StarBorderIcon sx={{ color: "#FFD700" }} />
                    )}
                  </IconButton>
                ))}
              </Box>
              <Divider sx={{ marginY: 2 }} />

              {/* Đánh giá xe khách */}
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {t("Xếp hạng chuyến xe")}
              </Typography>
              <Box display="flex" justifyContent="center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton key={star} onClick={() => setCoachRating(star)}>
                    {star <= coachRating ? (
                      <StarIcon sx={{ color: "#FFD700" }} />
                    ) : (
                      <StarBorderIcon sx={{ color: "#FFD700" }} />
                    )}
                  </IconButton>
                ))}
              </Box>
              <Divider sx={{ marginY: 2 }} />

              {/* Đánh giá chuyến đi */}
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {t("Xếp hạng chuyến đi")}
              </Typography>
              <Box display="flex" justifyContent="center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton key={star} onClick={() => setTripRating(star)}>
                    {star <= tripRating ? (
                      <StarIcon sx={{ color: "#FFD700" }} />
                    ) : (
                      <StarBorderIcon sx={{ color: "#FFD700" }} />
                    )}
                  </IconButton>
                ))}
              </Box>

              {/* TextField cho nhận xét */}
              <TextField
                label={t("Nhận xét")}
                fullWidth
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ marginTop: 2 }}
              />
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenReviewModal(false)}
            variant="contained"
            color="error"
          >
            {t("Hủy")}
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color="success"
          >
            {t("Gửi đánh giá")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notification;
