import { http } from "../../utils/http";

// Lấy số điểm thưởng hiện tại của người dùng
export const getLoyaltyPoints = async () => {
    try {
      const response = await http.get('loyalty/points');
      return response.data; // Bây giờ `response.data` sẽ là object có `loyaltyPoints`
    } catch (error) {
      console.error('Error fetching loyalty points:', error.response?.data || error.message);
      throw new Error(error.response?.data || "Có lỗi xảy ra khi lấy số điểm thưởng.");
    }
  };
  

// Sử dụng điểm thưởng cho một booking cụ thể
export const useLoyaltyPoints = async (bookingId, points) => {
  try {
    const response = await http.post('loyalty/use', { bookingId, points });
    return response.data;
  } catch (error) {
    console.error('Error using loyalty points:', error.response?.data || error.message);
    throw new Error(error.response?.data || "Có lỗi xảy ra khi sử dụng điểm thưởng.");
  }
};

// Lấy lịch sử giao dịch điểm thưởng với phân trang
export const getLoyaltyTransactions = async (page = 0, limit = 10) => {
    try {
        // Sửa lại params để không có lỗi cú pháp
        const response = await http.get('/loyalty/transactions', {
            params: {
                page: page,
                limit: limit
            },
        });
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error('Error fetching loyalty transactions:', error);
        throw new Error('Có lỗi xảy ra khi lấy lịch sử giao dịch.');
    }
};
