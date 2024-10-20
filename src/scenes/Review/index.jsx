import {
    Box,
    Button,
    IconButton,
    TextField,
    Typography,
    useTheme,
  } from "@mui/material";
  import StarIcon from "@mui/icons-material/Star";
  import StarBorderIcon from "@mui/icons-material/StarBorder";
  import { useState } from "react";
  import { useMutation } from "@tanstack/react-query";
  import { tokens } from "../../theme";
  import { useTranslation } from "react-i18next";
  import * as reviewApi from "../../queries/review/reviewQueries";
  
  const Review = ({ bookingId }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { t } = useTranslation();
  
    const [driverRating, setDriverRating] = useState(0);
    const [coachRating, setCoachRating] = useState(0);
    const [tripRating, setTripRating] = useState(0);
    const [comment, setComment] = useState("");
  
    // Render ngôi sao để đánh giá
    const renderStars = (rating, setRating) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <IconButton
            key={i}
            onClick={() => setRating(i)}
            sx={{ padding: "5px" }}
          >
            {i <= rating ? (
              <StarIcon sx={{ color: "#FFD700" }} />
            ) : (
              <StarBorderIcon sx={{ color: "#FFD700" }} />
            )}
          </IconButton>
        );
      }
      return stars;
    };
  
    // Mutation để gửi đánh giá đến backend
    const createReviewMutation = useMutation({
      mutationFn: reviewApi.createReview,
      onSuccess: () => {
        alert(t("Review submitted successfully!"));
      },
      onError: (error) => {
        alert(error.response?.data?.message || t("Failed to submit review."));
      },
    });
  
    // Hàm xử lý khi khách hàng nhấn Submit
    const handleSubmitReview = () => {
      const reviewData = {
        bookingId,
        driverRating,
        coachRating,
        tripRating,
        comment,
      };
      createReviewMutation.mutate(reviewData);
    };
  
    return (
      <Box
        m="20px"
        p="20px"
        borderRadius="8px"
        boxShadow="0 4px 8px rgba(0,0,0,0.1)"
        maxWidth="600px"
        mx="auto"
      >
        <Typography variant="h3" fontWeight='bold' textAlign="center" mb={4} color="black">
          {t("Rate Your Trip")}
        </Typography>
  
        {/* Đánh giá tài xế */}
        <Box mb={3}>
          <Typography variant="h6">{t("Driver Rating")}</Typography>
          <Box display="flex" justifyContent="center" mb={2}>
            {renderStars(driverRating, setDriverRating)}
          </Box>
        </Box>
  
        {/* Đánh giá xe khách */}
        <Box mb={3}>
          <Typography variant="h6">{t("Coach Rating")}</Typography>
          <Box display="flex" justifyContent="center" mb={2}>
            {renderStars(coachRating, setCoachRating)}
          </Box>
        </Box>
  
        {/* Đánh giá chuyến đi */}
        <Box mb={3}>
          <Typography variant="h6">{t("Trip Rating")}</Typography>
          <Box display="flex" justifyContent="center" mb={2}>
            {renderStars(tripRating, setTripRating)}
          </Box>
        </Box>
  
        {/* Bình luận */}
        <TextField
          label={t("Comments")}
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 3, bgcolor: colors.primary[400] }}
        />
  
        {/* Nút Submit */}
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmitReview}
            sx={{ padding: "10px 20px" }}
          >
            {t("Submit Review")}
          </Button>
        </Box>
      </Box>
    );
  };
  
  export default Review;
  