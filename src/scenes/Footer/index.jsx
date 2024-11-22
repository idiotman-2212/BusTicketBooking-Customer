import React from 'react';
import {
  Facebook,
  Instagram,
  YouTube,
  Phone,
  Mail,
  LocationOn,
  AccessTime
} from '@mui/icons-material';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Thông tin công ty */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              CÔNG TY VẬN TẢI XE KHÁCH
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1 }} />
                <Typography variant="body2">
                  123 Đường Trần Hưng Đạo, Thành phố Quy Nhơn, Tỉnh Bình Định
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 1 }} />
                <Typography variant="body2">1900 989859</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Mail sx={{ mr: 1 }} />
                <Typography variant="body2">datvexegiare@gmail.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Giờ làm việc: 7:00 - 20:00
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Đường dẫn hữu ích */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              THÔNG TIN
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/about" color="inherit" underline="hover">
                Về chúng tôi
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Điều khoản sử dụng
              </Link>
              <Link href="/regulations" color="inherit" underline="hover">
                Chính sách bảo mật
              </Link>
              <Link href="/faq" color="inherit" underline="hover">
                Câu hỏi thường gặp
              </Link>
            </Box>
          </Grid>

          {/* Dịch vụ */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              DỊCH VỤ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/routes" color="inherit" underline="hover">
                Tuyến xe
              </Link>
              <Link href="/schedule" color="inherit" underline="hover">
                Lịch trình
              </Link>
              <Link href="/booking" color="inherit" underline="hover">
                Đặt vé online
              </Link>
              <Link href="/promotion" color="inherit" underline="hover">
                Khuyến mãi
              </Link>
            </Box>
          </Grid>

          {/* Kết nối */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              KẾT NỐI VỚI CHÚNG TÔI
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank"
                sx={{ color: 'white', mr: 1 }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                href="https://instagram.com" 
                target="_blank"
                sx={{ color: 'white', mr: 1 }}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                href="https://youtube.com" 
                target="_blank"
                sx={{ color: 'white' }}
              >
                <YouTube />
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Đăng ký nhận tin khuyến mãi
            </Typography>
            <Box
              component="form"
              sx={{
                mt: 1,
                display: 'flex',
                gap: 1
              }}
            >
              <input
                type="email"
                placeholder="Email của bạn"
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  flex: 1
                }}
              />
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fff',
                  color: '#1976d2',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Đăng ký
              </button>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mt: 4, pt: 3 }}>
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Công ty Vận tải Xe khách. Tất cả quyền được bảo lưu.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;