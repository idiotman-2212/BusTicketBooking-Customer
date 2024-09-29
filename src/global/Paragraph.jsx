import { Box, Typography, useTheme } from "@mui/material";
import React from "react";


//đồng nhất font chữ
const Paragraph = ({ title, content }) => {
  const theme = useTheme(); // Sử dụng theme từ MUI
  return (
    <Box width="100%" display="flex" flexDirection="column" p="20px 30px">
      <Typography fontWeight="bold" variant="h4">
        {title}
      </Typography>
      <Typography variant="h5" mt="10px">
        {content}
      </Typography>
    </Box>
  );
};

export default Paragraph;
