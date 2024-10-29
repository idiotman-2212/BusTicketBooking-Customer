import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider } from '@mui/material';

const Regulation = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign:'center'}}>Nội quy và Quy định của nhà xe</DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="h5" gutterBottom>
          Quy định khi đặt vé
        </Typography>
        <Typography variant="body1" paragraph>
          - Khách hàng cần cung cấp thông tin chính xác khi đặt vé.
        </Typography>
        <Typography variant="body1" paragraph>
          - Vé đã đặt không được hoàn trả sau khi thanh toán.
        </Typography>
        <Typography variant="body1" paragraph>
          - Khi chuyến đi khởi hành thì sẽ không dừng lại dọc đường.
        </Typography>
        <Typography variant="body1" paragraph>
          - Khách hàng có thể hủy vé trong vòng 24 giờ trước giờ khởi hành bằng cách gọi đến số điện thoại của nhân viên CSKH (0326917158) để được hỗ trợ.
        </Typography>
        <Typography variant="body1" paragraph>
          - Nhà xe chỉ hỗ trợ đón và trả khách tại những điểm cố định có sẵn, quý khách vui lòng di chuyển đến những địa điểm được cung cấp sẵn để nhà xe dễ dàng vận chuyển hơn. Xin cảm ơn.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom>
          Chính sách hủy vé
        </Typography>
        <Typography variant="body1" paragraph>
          - Phí hủy vé sẽ được áp dụng nếu hủy vé trong thời gian quy định.
        </Typography>
        <Typography variant="body1" paragraph>
          - Mọi thông tin cá nhân của khách hàng sẽ được bảo mật tuyệt đối.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button variant="contained"   color="success" onClick={onClose}>
          Tôi đã đọc nội quy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Regulation;
