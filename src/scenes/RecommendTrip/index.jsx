import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Slide,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { http } from "../../utils/http";

const RecommendationModal = ({ onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await http.get("trips/recommend");
        if (response.data && response.data.length > 0) {
          setRecommendations(response.data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleBooking = (tripId) => {
    navigate(`/booking`);
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          py: 2, 
          px: 3 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TravelExploreIcon />
          <Typography variant="h6" fontWeight="bold">
            Chuyến đi được đề xuất cho bạn
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          color="inherit"
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: 'background.default' }}>
        {loading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              py: 4 
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Stack spacing={3}>
            {recommendations.map((trip) => (
              <Card 
                key={trip.tripId}
                elevation={3}
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s',
                  '&:hover': { 
                    transform: 'scale(1.02)',
                    boxShadow: 4 
                  }
                }}
                onClick={() => handleBooking(trip.tripId)}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <Typography variant="h6" color="primary">
                      {trip.sourceProvince} → {trip.destProvince}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="secondary" 
                      fontWeight="bold"
                    >
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(trip.price)}
                    </Typography>
                  </Box>

                  <Stack spacing={1} color="text.secondary">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DirectionsBusIcon fontSize="small" />
                      <Typography variant="body2">
                        <strong>Loại xe:</strong> {trip.coachType}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2">
                        <strong>Điểm đón:</strong> {trip.pickUpLocation}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2">
                        <strong>Điểm trả:</strong> {trip.dropOffLocation}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Thời gian khởi hành:</strong>{" "}
                        {new Date(trip.departureDateTime).toLocaleString("vi-VN")}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationModal;