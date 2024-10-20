import React, { useEffect, useState, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Box } from "@mui/material";
import { tokens, ColorModeContext } from "../../theme";
import Paragraph from "../../global/Paragraph";
import { useTranslation } from "react-i18next";
import { useTheme } from "@emotion/react";
import Regulation from "../Regulation"; // Import Regulation component

const LandingPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);
  const { t } = useTranslation();
  const [openRegulations, setOpenRegulations] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái "vừa đăng nhập" từ localStorage
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const hasReadRegulations = localStorage.getItem("hasReadRegulations") === "true";

    // Nếu người dùng vừa đăng nhập và chưa đọc quy định, hiển thị modal
    if (isLoggedIn && !hasReadRegulations) {
      setOpenRegulations(true);
      localStorage.removeItem("loggedIn"); // Xóa trạng thái "vừa đăng nhập" để tránh hiển thị lại modal
    }
  }, []);

  const handleRegulationsClose = () => {
    setOpenRegulations(false);
    localStorage.setItem("hasReadRegulations", "true"); // Lưu trạng thái đã đọc quy định
  };

  return (
    <Box 
      mt="100px"
      bgcolor={theme.palette.background.default} // Màu nền từ theme
      color={theme.palette.text.primary} // Màu chữ từ theme
    >
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide>
          <img
            src="/bed_img1.jpg"
            style={{ width: "100%", height: "400px", borderRadius: "10px" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="/chair_img.jpg"
            style={{ width: "100%", height: "400px", borderRadius: "10px" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="/bed_img.jpg"
            style={{ width: "100%", height: "400px", borderRadius: "10px" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="/limousine_img.jpg"
            style={{ width: "100%", height: "400px", borderRadius: "10px" }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="/limousine_img1.jpg"
            style={{ width: "100%", height: "400px", borderRadius: "10px" }}
          />
        </SwiperSlide>
      </Swiper>

      <Box bgcolor={colors.primary[400]} mt="40px" borderRadius="8px">
        <Paragraph
          title={t("Đặt vé trực tuyến trên DATVEXE")}
          content={t("Hầu hết khách du lịch Việt Nam thích đi du lịch đến điểm đến ưa thích của họ bằng đường bộ. Đó là do thực tế là một chuyến đi đường cho phép bạn thưởng thức vẻ đẹp phong cảnh theo tốc độ của riêng bạn. Hơn nữa, sự thoải mái khi đi trên một chiếc xe cùng gia đình và bạn bè của bạn là không gì sánh được. Bạn có thể chọn đặt xe taxi trực tuyến sẽ giúp hành trình của bạn không gặp rắc rối. Bạn chỉ cần truy cập cổng DATVEXE và chọn một chiếc taxi.")}
        />
        <Paragraph
          title={t("Đặt xe trực tuyến")}
          content={t("Khi bạn chọn chúng tôi cho các yêu cầu đặt xe taxi của bạn, chúng tôi cung cấp cho bạn các dịch vụ cao cấp và quan trọng nhất là độ tin cậy cao. DATVEXE được coi là một trong những nền tảng đặt xe phổ biến nhất. Bên cạnh đó, bạn cũng có thể truy cập trang web để biết vé tàu, chuyến bay, xe buýt. Phần tốt nhất là bạn có thể nhận được những chiếc xe hàng đầu cho điểm đến ưa thích của mình.")}
        />
        <Paragraph
          title={t("Đặt xe để có một chuyến đi thú vị trên đường")}
          content={t("Trong trường hợp bạn có bất kỳ thắc mắc nào liên quan đến việc đặt vé, bạn có thể liên hệ với dịch vụ khách hàng 24/7 của DATVEXE và trao đổi với các chuyên gia về chuyến đi của bạn. Trong khi đặt xe ga với chúng tôi, bạn cũng có thể được hỗ trợ trong việc thảo luận về hành trình và lên kế hoạch cho chuyến đi của mình. Hơn nữa, tùy chọn sử dụng ứng dụng dành cho thiết bị di động sẽ giảm bớt sự phức tạp khi đặt taxi. Tất cả các dịch vụ do DATVEXE cung cấp đều có sẵn chỉ với một cú nhấp chuột. Hơn nữa, bạn cũng có thể nhận được các ưu đãi và chiết khấu hấp dẫn nếu đặt phòng qua GoIbibo.")}
        />
        <Paragraph
          title={t("Thanh toán minh bạch")}
          content={t("Hãy yên tâm, khi bạn chọn DATVEXE cho yêu cầu đặt xe taxi của mình, các dịch vụ được cung cấp ở mức giá hợp lý nhất. Bên cạnh đó, DATVEXE cũng duy trì tính minh bạch trong thanh toán 100%. Vì vậy, không có khoản phí ẩn nào liên quan từ đầu đến cuối cuộc hành trình của bạn. Bạn có thể chọn từ các phương thức thanh toán ưa thích của mình. Một số tùy chọn thanh toán có sẵn trên DATVEXE bao gồm thẻ ghi nợ, thẻ tín dụng, ngân hàng trực tuyến và UPI.")}
        />
        <Paragraph
          title={t("Dịch vụ đáng tin cậy")}
          content={t("Mỗi người đang tìm kiếm một trải nghiệm đáng tin cậy, ưu tiên các nhu cầu và mối quan tâm của họ. Đó là lý do tại sao, DATVEXE cung cấp trải nghiệm tuyệt vời cho người dùng khi họ đặt taxi trực tuyến. Bạn có thể kết nối với dịch vụ hỗ trợ khách hàng 24/7 của DATVEXE và giải quyết tất cả các thắc mắc liên quan đến đặt phòng của bạn. Từ việc cung cấp các dịch vụ tốt nhất để đảm bảo một chuyến đi an toàn, DATVEXE đảm bảo rằng chuyến đi của bạn sẽ thú vị.")}
        />
      </Box>

      {/* Gọi component Regulation và điều khiển mở/đóng modal từ LandingPage */}
      <Regulation open={openRegulations} onClose={handleRegulationsClose} />
    </Box>
  );
};

export default LandingPage;
