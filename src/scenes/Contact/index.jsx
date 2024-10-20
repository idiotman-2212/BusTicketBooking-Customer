import React, { useState, useContext } from "react";
import { Fab, Menu, MenuItem, Tooltip, Box, useTheme } from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { ColorModeContext, tokens } from "../../theme";

const Contact = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Sử dụng token màu từ theme
  const colorMode = useContext(ColorModeContext);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Nút Liên hệ (Fab) */}
      <Tooltip title="Liên hệ">
        <Fab
          color="primary"
          aria-label="contact"
          onClick={handleClick}
          sx={{
            backgroundColor: theme.palette.background.primary,
          }}
        >
          <ContactSupportIcon />
        </Fab>
      </Tooltip>

      {/* Menu dropup chứa các phương thức liên hệ */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
            backgroundColor: theme.palette.background.primary, // Nền theo chế độ sáng/tối
          },
        }}
      >
        {/* Zalo */}
        <MenuItem onClick={handleClose} sx={{ padding: 2 }}>
          <img
            src="/public/zalo.png"
            alt="Zalo"
            style={{ width: 32, height: 32, marginRight: 16 }}
          />
          <a
            href="https://zalo.me/0326917158"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "18px",
              color: theme.palette.text.primary, // Màu chữ theo chế độ sáng/tối
              textDecoration: "none",
            }}
          >
            Zalo
          </a>
        </MenuItem>

        {/* Messenger */}
        <MenuItem onClick={handleClose} sx={{ padding: 2 }}>
          <img
            src="/public/messenger.png"
            alt="Messenger"
            style={{ width: 32, height: 32, marginRight: 16 }}
          />
          <a
            href="https://m.me/idiotboy22122002"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "18px",
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
          >
            Messenger
          </a>
        </MenuItem>

        {/* SMS */}
        <MenuItem onClick={handleClose} sx={{ padding: 2 }}>
          <img
            src="/public/telephone.png"
            alt="SMS"
            style={{ width: 32, height: 32, marginRight: 16 }}
          />
          <a
            href="sms:+84326917158"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "18px",
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
          >
            SMS
          </a>
        </MenuItem>

        {/* Email */}
        <MenuItem onClick={handleClose} sx={{ padding: 2 }}>
          <img
            src="/public/email.png"
            alt="Email"
            style={{ width: 32, height: 32, marginRight: 16 }}
          />
          <a
            href="mailto:abclsdjf23@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "18px",
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
          >
            Email
          </a>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Contact;
