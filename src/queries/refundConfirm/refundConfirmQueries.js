import { http } from '../../utils/http';

// Hàm xác nhận hoàn tiền
export const confirmRefund = async (bookingId) => {
  try {
    const response = await http.post(`bookings/refund/confirm/${bookingId}`);
    return response.data; // Trả về dữ liệu thành công từ backend
  } catch (error) {
    // Xử lý lỗi
    throw new Error(error.response?.data?.message || 'Không thể xác nhận hoàn tiền');
  }
};
