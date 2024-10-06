import { http } from '../../utils/http';

// Lấy danh sách thông báo của người dùng
export const getAllNotifications  = async () => {
    const response = await http.get('/notifications/user');
    return response.data;
  };
  
// Lấy các thông báo trong 7 ngày qua
export const getRecentNotifications = async () => {
    try {
        const response = await http.get('/notifications/recent');
        return response.data;
    } catch (error) {
        console.error("Error fetching recent notifications:", error);
        throw error;
    }
};

// Lấy các thông báo chưa đọc
export const getUnreadNotifications = async () => {
    try {
        const response = await http.get('/notifications/unread');
        return response.data;
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        throw error;
    }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadNotificationCount = async () => {
    try {
        const response = await http.get('/notifications/unread-count');
        return response.data;
    } catch (error) {
        console.error("Error fetching unread notification count:", error);
        throw error;
    }
};

// Đánh dấu thông báo là đã đọc
export const markNotificationAsRead = async (notificationId) => {
    try {
        await http.post(`/notifications/${notificationId}/read`);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

// Thêm thông báo mới cho người dùng
export const addNotification = async (username, title, message) => {
    try {
        await http.post('/notifications', null, {
            params: { username, title, message },
        });
    } catch (error) {
        console.error("Error adding notification:", error);
        throw error;
    }
};

// Cập nhật nội dung thông báo
export const updateNotification = async (notificationId, message) => {
    try {
        await http.put(`/notifications/${notificationId}`, null, {
            params: { message },
        });
    } catch (error) {
        console.error("Error updating notification:", error);
        throw error;
    }
};

// Xóa một thông báo
export const deleteNotification = async (notificationId) => {
    try {
        await http.delete(`/notifications/${notificationId}`);
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};
