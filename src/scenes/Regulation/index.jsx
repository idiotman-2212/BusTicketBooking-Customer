import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Regulation = ({ open, onClose }) => {
  const { t } = useTranslation(); // Khởi tạo hàm t từ useTranslation

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign:'center'}}>
        {t("Nội quy và Quy định của nhà xe")}
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {t("Quy định khi đặt vé")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Khách hàng cần cung cấp thông tin chính xác khi đặt vé.")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Vé đã đặt không được hoàn trả sau khi thanh toán.")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Khi chuyến đi khởi hành thì sẽ không dừng lại dọc đường.")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Khách hàng có thể hủy vé trong vòng 24 giờ trước giờ khởi hành bằng cách gọi đến số điện thoại của nhân viên CSKH (0326917158) để được hỗ trợ.")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Nhà xe chỉ hỗ trợ đón và trả khách tại những điểm cố định có sẵn, quý khách vui lòng di chuyển đến những địa điểm được cung cấp sẵn để nhà xe dễ dàng vận chuyển hơn. Xin cảm ơn.")}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom fontWeight="bold">
          {t("Chính sách hủy vé")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Phí hủy vé sẽ được áp dụng nếu hủy vé trong thời gian quy định.")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Nếu quý khách muốn hoàn tiền vé đặt thì cần phải tới quầy để xác nhận với nhân viên.")}
        </Typography>
        <Typography variant="body1" paragraph>
          - {t("Mọi thông tin cá nhân của khách hàng sẽ được bảo mật tuyệt đối.")}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="success" onClick={onClose}>
          {t("Tôi đã đọc nội quy")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Regulation;
