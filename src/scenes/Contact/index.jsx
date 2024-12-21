import React, { useState, useContext } from "react";
import { Fab, Menu, MenuItem, Tooltip, Box, useTheme, useMediaQuery } from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { ColorModeContext, tokens } from "../../theme";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ position: "fixed", bottom: isMobile ? 10 : 20, right: isMobile ? 10 : 20, zIndex: 1000 }}>
      <Tooltip title={t("Liên hệ")}>
        <Fab
          color="primary"
          aria-label="contact"
          onClick={handleClick}
          sx={{
            backgroundColor: theme.palette.background.primary,
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
          }}
        >
          <ContactSupportIcon fontSize={isMobile ? "small" : "medium"} />
        </Fab>
      </Tooltip>

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
            backgroundColor: theme.palette.background.primary,
          },
        }}
      >
        {/* Zalo */}
        <MenuItem onClick={handleClose} sx={{ padding: isMobile ? 1 : 2 }}>
          <img
            src="/zalo.png"
            alt="Zalo"
            style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, marginRight: 16 }}
          />
          <a
            href="https://zalo.me/0326917158"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: isMobile ? "16px" : "18px",
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
          >
            Zalo
          </a>
        </MenuItem>

        {/* Messenger */}
        <MenuItem onClick={handleClose} sx={{ padding: isMobile ? 1 : 2 }}>
          <img
            src="/messenger.png"
            alt="Messenger"
            style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, marginRight: 16 }}
          />
          <a
            href="https://m.me/idiotboy22122002"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: isMobile ? "16px" : "18px",
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
          >
            Messenger
          </a>
        </MenuItem>

        {/* SMS */}
        <MenuItem onClick={handleClose} sx={{ padding: isMobile ? 1 : 2 }}>
          <img
            src="/telephone.png"
            alt="SMS"
            style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, marginRight: 16 }}
          />
          <a
            href="sms:+84326917158"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: isMobile ? "16px" : "18px",
              color: theme.palette.text.primary,
              textDecoration: "none",
            }}
          >
            SMS
          </a>
        </MenuItem>

        {/* Email */}
        <MenuItem onClick={handleClose} sx={{ padding: isMobile ? 1 : 2 }}>
          <img
            src="/email.png"
            alt="Email"
            style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, marginRight: 16 }}
          />
          <a
            href="mailto:abclsdjf23@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: isMobile ? "16px" : "18px",
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
