import React, { useState, useEffect } from 'react';
import { getUnreadNotifications, getRecentNotifications, markNotificationAsRead } from '../../queries/notification/notificationQueries';
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
    Avatar,
    Card,
    CardHeader,
    CardContent
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useTheme, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Styled components
const NotificationBox = styled(Card)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),  // Rounded corners
    boxShadow: theme.shadows[3],
    transition: 'transform 0.3s ease',
    "&:hover": {
        transform: 'scale(1.03)',  // Slight zoom on hover
        backgroundColor: theme.palette.action.hover
    }
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
    display: 'block',
    margin: '0 auto',
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.background.default,
    "&:hover": {
        backgroundColor: theme.palette.primary.light
    }
}));

const NotificationDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
}));

const NotificationDialogActions = styled(DialogActions)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const Notification = () => {
    const [unreadNotifications, setUnreadNotifications] = useState([]); 
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openAllNotificationsDialog, setOpenAllNotificationsDialog] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const theme = useTheme();
    const { t } = useTranslation();

    // Lấy thông báo chưa đọc từ backend
    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            try {
                const unreadNotificationsData = await getUnreadNotifications();
                setUnreadNotifications(unreadNotificationsData); 
            } catch (error) {
                console.error("Error fetching unread notifications", error);
            }
        };

        fetchUnreadNotifications();
    }, []);

    // Lấy dữ liệu thông báo gần đây từ backend
    const handleViewAllClick = async () => {
        try {
            const recentNotificationsData = await getRecentNotifications();
            setRecentNotifications(recentNotificationsData);
            setOpenAllNotificationsDialog(true);
        } catch (error) {
            console.error("Error fetching recent notifications", error);
        }
    };

    // Đánh dấu thông báo là đã đọc và mở modal chi tiết
    const handleNotificationClick = async (notification) => {
        try {
            await markNotificationAsRead(notification.id);

            setUnreadNotifications(prevUnread => prevUnread.filter(n => n.id !== notification.id));

            setSelectedNotification(notification);
            setOpenModal(true);
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedNotification(null);
    };

    const handleCloseAllNotificationsDialog = () => {
        setOpenAllNotificationsDialog(false);
    };

    // Mở menu thông báo
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Đóng menu thông báo
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            {/* Biểu tượng thông báo với Badge */}
            <IconButton color="inherit" onClick={handleMenuOpen}>
                <Badge badgeContent={unreadNotifications.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            {/* Menu thông báo */}
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
                {/* Hiển thị thông báo chưa đọc */}
                {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((notification) => (
                        <MenuItem key={notification.id} onClick={() => handleNotificationClick(notification)}>
                            <ListItemText 
                                primary={<Typography variant="body1" style={{ fontWeight: 500 }}>{notification.title || t("No title")}</Typography>} 
                                secondary={<Typography variant="caption" color="textSecondary">{new Date(notification.createdAt).toLocaleString()}</Typography>} 
                            />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>
                        <Typography fontSize="13px" fontWeight="bold" variant="body2">{t("No new notifications")}</Typography>
                    </MenuItem>
                )}

                <Divider />
                {/* Xem tất cả thông báo */}
                <MenuItem onClick={handleViewAllClick}>
                    <ViewAllButton>{t("View all notifications")}</ViewAllButton>
                </MenuItem>
            </Menu>

            {/* Modal chi tiết thông báo */}
            <Dialog open={openModal} onClose={handleCloseModal}>
                <NotificationDialogTitle>{t("Notification Details")}</NotificationDialogTitle>
                <DialogContent>
                    {selectedNotification && (
                        <>
                            <Typography variant="h6" gutterBottom>{t("Title")}: {selectedNotification.title}</Typography>
                            <Typography variant="body1" gutterBottom>{t("Content")}: {selectedNotification.message}</Typography>
                        </>
                    )}
                </DialogContent>
                <NotificationDialogActions>
                    <Button onClick={handleCloseModal} color="primary">{t("Close")}</Button>
                </NotificationDialogActions>
            </Dialog>

            {/* Hộp thoại Xem tất cả thông báo */}
            <Dialog open={openAllNotificationsDialog} onClose={handleCloseAllNotificationsDialog} fullWidth maxWidth="md">
                <NotificationDialogTitle >{t("All Notifications")}</NotificationDialogTitle>
                <DialogContent>
                    {recentNotifications.length > 0 ? (
                        recentNotifications.map((notification) => (
                            <NotificationBox key={notification.id}>
                                <CardHeader
                                    avatar={<Avatar><AccountCircleIcon /></Avatar>}
                                    title={<Typography variant="subtitle1" fontSize="13px" style={{ fontWeight: 'bold' }}>{notification.title || t("No title")}</Typography>}
                                    subheader={<Typography fontSize="13px" variant="caption">{new Date(notification.createdAt).toLocaleString()}</Typography>}
                                />
                                <CardContent>
                                    <Typography variant="body2" fontSize="13px" style={{ color: theme.palette.text.primary }}>
                                        {notification.message}
                                    </Typography>
                                </CardContent>
                            </NotificationBox>
                        ))
                    ) : (
                        <Typography variant="body2">{t("No notifications available")}</Typography>
                    )}
                </DialogContent>
                <NotificationDialogActions>
                    <Button onClick={handleCloseAllNotificationsDialog} style={{ fontWeight:'bold' }} variant='contained' color="secondary">{t("Close")}</Button>
                </NotificationDialogActions>
            </Dialog>
        </Box>
    );
};

export default Notification;
