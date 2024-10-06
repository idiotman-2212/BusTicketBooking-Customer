import React, { useState, useEffect } from 'react';
import {
  getUnreadNotifications,
  getRecentNotifications,
  getAllNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  deleteNotification
} from '../../queries/notification/notificationQueries';
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
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete'; // Import icon để xóa thông báo
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const Notification = () => {
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openRecentModal, setOpenRecentModal] = useState(false);
  const [openAllModal, setOpenAllModal] = useState(false); // Separate modal for all notifications
  const [loadingUnread, setLoadingUnread] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    fetchUnreadNotifications();
    fetchUnreadCount();

    const intervalId = setInterval(() => {
      fetchUnreadNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      setLoadingUnread(true);
      const unreadNotificationsData = await getUnreadNotifications();
      setUnreadNotifications(unreadNotificationsData);
    } catch (error) {
      console.error("Error fetching unread notifications", error);
    } finally {
      setLoadingUnread(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread notification count", error);
    }
  };

  const handleViewRecentClick = async () => {
    try {
      setLoadingRecent(true);
      const recentNotificationsData = await getRecentNotifications();
      setRecentNotifications(recentNotificationsData);
      setOpenRecentModal(true); // Open recent notifications modal
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
      setAllNotifications(allNotificationsData);
      setOpenAllModal(true); // Open all notifications modal
    } catch (error) {
      console.error("Error fetching all notifications", error);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      setUnreadNotifications((prev) => prev.filter(n => n.id !== notification.id));
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  // Xử lý xóa thông báo
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      // Sau khi xóa, cập nhật lại danh sách recent và all để loại bỏ thông báo đã xóa
      setRecentNotifications((prev) => prev.filter(n => n.id !== notificationId));
      setAllNotifications((prev) => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  const handleCloseRecentModal = () => {
    setOpenRecentModal(false);
    setRecentNotifications([]);
  };

  const handleCloseAllModal = () => {
    setOpenAllModal(false);
    setAllNotifications([]);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <Badge badgeContent={unreadCount} color="error">
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
            width: '350px',
          },
        }}
      >
        {loadingUnread ? (
          <CircularProgress />
        ) : (
          unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <MenuItem key={notification.id} onClick={() => handleNotificationClick(notification)}>
                <ListItemText 
                  primary={<Typography variant="body1" style={{ fontWeight: 500 }}>{notification.title || t("No title")}</Typography>} 
                  secondary={<Typography variant="caption" color="textSecondary">{new Date(notification.sendDateTime).toLocaleString()}</Typography>} 
                />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <Typography fontSize="13px" fontWeight="bold" variant="body2">{t("No new notifications")}</Typography>
            </MenuItem>
          )
        )}

        <Divider />
        <Box>
          <MenuItem onClick={handleViewRecentClick} >
            <Button variant='outlined' color='secondary'>View recent notifications</Button>
          </MenuItem>
          <MenuItem onClick={handleViewAllClick}>
            <Button variant='outlined' color='secondary'>View all notifications</Button>
          </MenuItem>
        </Box>  
      </Menu>

      {/* Dialog for recent notifications */}
      <Dialog open={openRecentModal} onClose={handleCloseRecentModal} fullWidth maxWidth="md">
        <DialogTitle
          style={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white,
          }}
        >
          {t("Recent Notifications")}
        </DialogTitle>
        <DialogContent>
          {loadingRecent ? (
            <CircularProgress />
          ) : recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <Card
                key={notification.id}
                style={{
                  width: '100%',
                  marginBottom: theme.spacing(2),
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: theme.spacing(2),
                  boxShadow: theme.shadows[3],
                  transition: 'transform 0.3s ease',
                  transform: 'scale(1)',
                  "&:hover": {
                    transform: 'scale(1.03)',
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <CardHeader
                  title={<Typography variant="subtitle1" fontSize="13px" style={{ fontWeight: 'bold' }}>{notification.title || t("No title")}</Typography>}
                  subheader={<Typography fontSize="13px" variant="caption">{new Date(notification.sendDateTime).toLocaleString()}</Typography>}
                />
                <CardContent>
                  <Typography variant="body2" fontSize="13px" style={{ color: theme.palette.text.primary }}>
                    {notification.message}
                  </Typography>
                  {/* Thêm nút xóa thông báo */}
                  <IconButton onClick={() => handleDeleteNotification(notification.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>{t("No notifications found.")}</Typography>
          )}
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            display: 'flex',
            justifyContent: 'center',
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button onClick={handleCloseRecentModal} style={{ fontWeight:'bold' }} variant='contained' color="secondary">{t("Close")}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for all notifications */}
      <Dialog open={openAllModal} onClose={handleCloseAllModal} fullWidth maxWidth="md">
        <DialogTitle
          style={{
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white,
          }}
        >
          {t("All Notifications")}
        </DialogTitle>
        <DialogContent>
          {loadingAll ? (
            <CircularProgress />
          ) : allNotifications.length > 0 ? (
            allNotifications.map((notification) => (
              <Card
                key={notification.id}
                style={{
                  width: '100%',
                  marginBottom: theme.spacing(2),
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: theme.spacing(2),
                  boxShadow: theme.shadows[3],
                  transition: 'transform 0.3s ease',
                  transform: 'scale(1)',
                  "&:hover": {
                    transform: 'scale(1.03)',
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <CardHeader
                  title={<Typography variant="subtitle1" fontSize="13px" style={{ fontWeight: 'bold' }}>{notification.title || t("No title")}</Typography>}
                  subheader={<Typography fontSize="13px" variant="caption">{new Date(notification.sendDateTime).toLocaleString()}</Typography>}
                />
                <CardContent>
                  <Typography variant="body2" fontSize="13px" style={{ color: theme.palette.text.primary }}>
                    {notification.message}
                  </Typography>
                  {/* Thêm nút xóa thông báo */}
                  <IconButton onClick={() => handleDeleteNotification(notification.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>{t("No notifications found.")}</Typography>
          )}
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(2),
            display: 'flex',
            justifyContent: 'center',
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button onClick={handleCloseAllModal} style={{ fontWeight:'bold' }} variant='contained' color="secondary">{t("Close")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notification;
