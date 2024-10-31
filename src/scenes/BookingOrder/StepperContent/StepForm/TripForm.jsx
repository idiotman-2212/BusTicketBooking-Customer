import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import DoNotDisturbAltOutlinedIcon from "@mui/icons-material/DoNotDisturbAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RouteIcon from "@mui/icons-material/Route";
import RoomIcon from "@mui/icons-material/Room";
import PinDropIcon from "@mui/icons-material/PinDrop";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CommuteIcon from "@mui/icons-material/Commute";
import PlaceIcon from "@mui/icons-material/Place";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import {
  LoadingButton,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  Slider,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse, isWithinInterval } from "date-fns";
import { useFormikContext } from "formik";
import React, { useEffect, useRef, useState } from "react";
import * as bookingApi from "../../../../queries/booking/ticketQueries";
import * as provinceApi from "../../../../queries/province/provinceQueries";
import * as tripApi from "../../../../queries/trip/tripQueries";
import { tokens } from "../../../../theme";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";

const getBookingPriceString = (trip) => {
  let finalPrice = trip.price;
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }
  // nhớ format cho đẹp
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(finalPrice);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};


const getDiscountedPriceDisplay = (trip) => {
  const originalPrice = trip.price;
  let finalPrice = originalPrice;

  // Tính toán giá sau khi giảm
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }

  // Trả về JSX để hiển thị giá gốc với gạch ngang nếu có giảm giá và giá giảm
  return (
    <Box display="flex" alignItems="center">
      {originalPrice !== finalPrice && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ textDecoration: 'line-through', marginRight: '8px' }}
        >
          {formatCurrency(originalPrice)}
        </Typography>
      )}
      <Typography variant="h5" color="error">
        {formatCurrency(finalPrice)}
      </Typography>
    </Box>
  );
};

const MIN_PRICE = 0;
const MAX_PRICE = 1_000_000;
const MIN_PRICE_DISTANCE = 10_000;

const TripForm = ({ field, setActiveStep, bookingData, setBookingData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();
  const [provinceClicked, setProvinceClicked] = useState(false);
  const [findClicked, setFindClicked] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [selectedSource, setSelectedSource] = useState(
    bookingData.trip?.source ?? null
  );
  const [selectedDestination, setSelectedDestination] = useState(
    bookingData.trip?.destination ?? null
  );
  const [numberOrderedSeats, setNumberOrderedSeats] = useState({});
  const [tripList, setTripList] = useState([]);
  const [selectedDepartureTimeBox, setSelectedDepartureTimeBox] = useState({});
  const [priceFilter, setPriceFilter] = useState([MIN_PRICE, MAX_PRICE]);
  const prevTimeBox = useRef(selectedDepartureTimeBox); // keep old timebox to perform uncheck timebox filter

  const formik = useFormikContext();
  const queryClient = useQueryClient();
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    field;

  // prepare data (province, trip, ...) for autocomplete combobox
  // lấy ds tỉnh
  const provinceQuery = useQuery({
    queryKey: ["provinces", "all"],
    queryFn: () => provinceApi.getAll(),
    enabled: provinceClicked,
  });

  // prepare find trip query
  //lấy ds các chuyến ứng với điểm nguồn và đích
  const findTripQuery = useQuery({
    queryKey: [
      "trips",
      selectedSource?.id,
      selectedDestination?.id,
      values.from.split(" ")[0],
      values.to.split(" ")[0],
    ],
    queryFn: () =>
      tripApi.findAllTripBySourceAndDest(
        selectedSource?.id,
        selectedDestination?.id,
        values.from.split(" ")[0],
        values.to.split(" ")[0]
      ),
    keepPreviousData: true,
    enabled: !!selectedSource && !!selectedDestination && findClicked,
  });

  //mở autocomplete tỉnh thành
  const handleProvinceOpen = () => {
    if (!provinceQuery.data) {
      setProvinceClicked(true);
      queryClient.prefetchQuery({
        queryKey: ["provinces", "all"],
        // queryFn: () => provinceApi.getAll(),
      });
    }
  };

  // handle error when route is not selected
  //chọn tuyến đường
  const handleSelectedRoute = () => {
    if (selectedSource === null) {
      formik.setFieldTouched("source", true);
      formik.validateField("source");
    }
    if (selectedDestination === null) {
      formik.setFieldTouched("destination", true);
      formik.validateField("destination");
    }

    setFindClicked(true);
  };

  // HANDLE SWAP LOCATION
  //hoán đổi địa điểm
  const handleSwapLocation = () => {
    // setFindClicked(false);
    setSelectedSource(selectedDestination);
    setSelectedDestination(selectedSource);
  };

  //lọc giờ đi
  const handleTimeBoxChange = (startTime, endTime) => {
    if (prevTimeBox.current?.startTime === startTime) {
      prevTimeBox.current = {};
      setSelectedDepartureTimeBox({});
    } else {
      prevTimeBox.current = { startTime, endTime };
      setSelectedDepartureTimeBox({ startTime, endTime });
    }
  };

  //sự kiện lọc giá
  const handlePriceChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }
    let newPrices = [-1, -1];
    if (activeThumb === 0) {
      newPrices = [
        Math.min(newValue[0], priceFilter[1] - MIN_PRICE_DISTANCE),
        priceFilter[1],
      ];
      setPriceFilter(newPrices);
    } else {
      newPrices = [
        priceFilter[0],
        Math.max(newValue[1], priceFilter[0] + MIN_PRICE_DISTANCE),
      ];
      setPriceFilter(newPrices);
    }
  };

  //lọc giờ đi
  const filterTrips = (originalTrips) => {
    let filteredTrips = [];

    // time box filter
    if (
      originalTrips &&
      originalTrips.length !== 0 &&
      selectedDepartureTimeBox?.startTime
    ) {
      const start = parse(
        selectedDepartureTimeBox.startTime,
        "HH:mm",
        new Date()
      );
      const end = parse(selectedDepartureTimeBox.endTime, "HH:mm", new Date());
      filteredTrips = originalTrips.filter((trip) => {
        const checkTime = parse(
          trip?.departureDateTime.split(" ")[1],
          "HH:mm",
          new Date()
        );
        return isWithinInterval(checkTime, { start: start, end: end });
      });
    } else filteredTrips = originalTrips;

    // price filter
    filteredTrips = filteredTrips.filter((trip) => {
      let finalPrice = trip.price;
      if (!isNaN(trip?.discount?.amount)) {
        finalPrice -= trip.discount.amount;
      }
      return priceFilter[0] <= finalPrice && finalPrice <= priceFilter[1];
    });

    return filteredTrips;
  };

  const getNumberOfOrderedSeats = async (tripId) => {
    const resp = await bookingApi.getSeatBooking(tripId);
    return resp;
  };

  // perform set trip list & calculate number of ordered seats
  useEffect(() => {
    const fetchOrderedSeats = async () => {
      if (findTripQuery.data && values.bookingDateTime) {
        const promises = findTripQuery.data.map((trip) =>
          getNumberOfOrderedSeats(trip.id)
        );

        const orderedSeatsList = await Promise.all(promises);

        // [{tripId: OrderedArray[]}, ...]
        const mappedOrderedSeatsList = {};
        findTripQuery.data.forEach(
          (trip, index) =>
            (mappedOrderedSeatsList[trip.id] = orderedSeatsList[index])
        );

        setNumberOrderedSeats(mappedOrderedSeatsList);
        setTripList(findTripQuery?.data);
      }
    };

    fetchOrderedSeats(); // Gọi hàm fetchOrderedSeats khi component được render
  }, [findTripQuery.data, values.bookingDateTime]);

  // perform filter trips
  useEffect(() => {
    const newFilteredTrips = filterTrips(findTripQuery?.data ?? []);
    setTripList(newFilteredTrips);
  }, [priceFilter, selectedDepartureTimeBox]);

  const formatLocation = (location) => {
    if (!location) return t("Chưa xác định");

    const { address, ward, district} = location;
    return `${address || ""}${ward ? ", " + ward : ""}${
      district ? ", " + district : ""
    }`;
  };

  return (
    <>
      <Box
        mt="20px"
        p="20px"
        display="grid"
        gap="30px"
        borderRadius="4px"
        gridTemplateColumns="repeat(12, 1fr)"
        bgcolor={colors.primary[400]}
      >
        {/* choose location */}
        <Box
          display="flex"
          alignItems="center"
          sx={{
            gridColumn: "span 6",
          }}
        >
          <Autocomplete
            id="source-province-autocomplete"
            fullWidth
            value={selectedSource}
            onOpen={handleProvinceOpen}
            onChange={(e, newValue) => {
              setFindClicked(false);
              setSelectedSource(newValue);
              setFieldValue("source", newValue);
            }}
            getOptionLabel={(option) => option.name}
            options={provinceQuery.data ?? []}
            loading={provinceClicked && provinceQuery.isLoading}
            sx={{
              gridColumn: "span 2",
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                name="source"
                label={t("Điểm đi")}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                onBlur={handleBlur}
                error={!!touched.source && !!errors.source}
                helperText={touched.source && errors.source}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {provinceClicked && provinceQuery.isLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <IconButton onClick={handleSwapLocation}>
            <SwapHorizIcon />
          </IconButton>

          <Autocomplete
            id="dest-province-autocomplete"
            fullWidth
            value={selectedDestination}
            onOpen={handleProvinceOpen}
            onChange={(e, newValue) => {
              setFindClicked(false);
              setSelectedDestination(newValue);
              setFieldValue("destination", newValue);
            }}
            getOptionLabel={(option) => option.name}
            options={provinceQuery.data ?? []}
            loading={provinceClicked && provinceQuery.isLoading}
            sx={{
              gridColumn: "span 2",
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                name="destination"
                label={t("Điểm đến")}
                color="warning"
                size="small"
                fullWidth
                variant="outlined"
                onBlur={handleBlur}
                error={!!touched.destination && !!errors.destination}
                helperText={touched.destination && errors.destination}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {provinceClicked && provinceQuery.isLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* choose time */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap="10px"
          sx={{
            gridColumn: "span 6",
          }}
        >
          {/* from date */}
          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                format="dd/MM/yyyy"
                label={t("From")}
                minDate={new Date()}
                value={parse(values.from, "yyyy-MM-dd", new Date())}
                onChange={(newDate) => {
                  setFieldValue("from", format(newDate, "yyyy-MM-dd"));
                }}
                slotProps={{
                  textField: {
                    InputProps: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarMonthIcon />
                        </InputAdornment>
                      ),
                    },
                    size: "small",
                    color: "warning",
                    error: !!touched.from && !!errors.from,
                  },
                  dialog: {
                    sx: {
                      "& .MuiButton-root": {
                        color: colors.primary[400],
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </FormControl>

          {/* to date */}
          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                format="dd/MM/yyyy"
                label={t("To")}
                minDate={parse(values.from, "yyyy-MM-dd", new Date())}
                value={parse(values.to, "yyyy-MM-dd", new Date())}
                onChange={(newDate) => {
                  setFieldValue("to", format(newDate, "yyyy-MM-dd"));
                }}
                slotProps={{
                  textField: {
                    InputProps: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarMonthIcon />
                        </InputAdornment>
                      ),
                    },
                    size: "small",
                    color: "warning",
                    error: !!touched.to && !!errors.to,
                  },
                  dialog: {
                    sx: {
                      "& .MuiButton-root": {
                        color: colors.primary[400],
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </FormControl>

          <LoadingButton
            disableRipple
            disableTouchRipple
            disableElevation
            disableFocusRipple
            onClick={() => {
              handleSelectedRoute();
            }}
            color="success"
            variant="contained"
            loadingPosition="start"
            loading={
              findTripQuery.isLoading &&
              findClicked &&
              !!selectedSource &&
              !!selectedDestination
            }
            startIcon={<SearchIcon />}
          >
            {t("Tìm")}
          </LoadingButton>
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
        m="30px 0"
        gap="10px"
      >
        {/* filter */}
        <Box
          borderRadius="4px"
          gridColumn="span 1"
          pb="30px"
          bgcolor={colors.primary[400]}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            m="16px 0"
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color={colors.greenAccent[400]}
            >
              {t("BỘ LỌC")} ({tripList.length})
            </Typography>
          </Box>
          <Divider />
          {/* departure time filter */}
          <Typography m="10px 0" variant="h5" pl="10px">
            {t("Giờ đi")}
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap="10px"
            padding="10px"
          >
            <Box
              onClick={() => handleTimeBoxChange("00:00", "06:00")}
              textAlign="center"
              p="2px 0"
              border={`4px solid ${colors.greenAccent[400]}`}
              borderRadius="15px"
              bgcolor={
                prevTimeBox.current?.startTime === "00:00"
                  ? colors.greenAccent[400]
                  : undefined
              }
              sx={{
                cursor: "pointer",
              }}
            >
              <Typography>{t("Sáng sớm")}</Typography>
              <Typography>00:00 - 06:00</Typography>
            </Box>
            <Box
              onClick={() => handleTimeBoxChange("06:01", "12:00")}
              textAlign="center"
              p="2px 0"
              border={`4px solid ${colors.greenAccent[400]}`}
              borderRadius="15px"
              bgcolor={
                prevTimeBox.current?.startTime === "06:01"
                  ? colors.greenAccent[400]
                  : undefined
              }
              sx={{
                cursor: "pointer",
              }}
            >
              <Typography>{t("Buổi sáng")}</Typography>
              <Typography>06:01 - 12:00</Typography>
            </Box>
            <Box
              onClick={() => handleTimeBoxChange("12:01", "18:00")}
              textAlign="center"
              p="2px 0"
              border={`4px solid ${colors.greenAccent[400]}`}
              borderRadius="15px"
              bgcolor={
                prevTimeBox.current?.startTime === "12:01"
                  ? colors.greenAccent[400]
                  : undefined
              }
              sx={{
                cursor: "pointer",
              }}
            >
              <Typography>{t("Buổi chiều")}</Typography>
              <Typography>12:01 - 18:00</Typography>
            </Box>
            <Box
              onClick={() => handleTimeBoxChange("18:01", "23:59")}
              textAlign="center"
              p="2px 0"
              border={`4px solid ${colors.greenAccent[400]}`}
              borderRadius="15px"
              bgcolor={
                prevTimeBox.current?.startTime === "18:01"
                  ? colors.greenAccent[400]
                  : undefined
              }
              sx={{
                cursor: "pointer",
              }}
            >
              <Typography>{t("Buổi tối")}</Typography>
              <Typography>18:01 - 23:59</Typography>
            </Box>
          </Box>

          {/* price filter */}
          <Typography m="10px 0" variant="h5" pl="10px">
            {t("Giá vé")}
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            p="0 30px"
            flexDirection="column"
          >
            <Slider
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={10_000}
              color="success"
              value={priceFilter}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              disableSwap
            />
            <Box display="flex" justifyContent="space-between">
              <Typography>{formatCurrency(priceFilter[0])}</Typography>
              <Typography>{formatCurrency(priceFilter[1])}</Typography>
            </Box>
          </Box>
        </Box>

        {/* trip lists */}
        <Box borderRadius="4px" gridColumn="span 3">
          {findTripQuery.isLoading &&
          findClicked &&
          !!selectedSource &&
          !!selectedDestination ? (
            <Box textAlign="center">
              <CircularProgress color="info" />
            </Box>
          ) : tripList.length !== 0 ? (
            <Box
              display="grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gap="20px"
              p="0 20px"
              sx={{
                width: "100%",
                position: "relative",
                overflow: "auto",
                maxHeight: 350,
              }}
            >
              {tripList.map((trip, index) => {
                return (
                  //  trip card
                  <Card
                    elevation={0}
                    onClick={() => {
                      setFieldValue("trip", trip);
                      setFieldValue("seatNumber", []); // avoid keeping old chosen seats when choose new Trip
                      setSelectedItemIndex(index);
                    }}
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 20px",
                      borderRadius: "10px",
                      gridColumn: "span 2",
                      cursor: "pointer",
                    }}
                  >
                    <Box display="flex" flexDirection="column">
                      <CardContent sx={{ flex: "1 0 auto" }}>
                        <Typography variant="h5" fontStyle="italic">
                          {t("Ngày giờ đi")}
                        </Typography>
                        <Typography variant="h4" mt="5px" fontWeight="bold">
                          {format(
                            parse(
                              trip.departureDateTime,
                              "yyyy-MM-dd HH:mm",
                              new Date()
                            ),
                            "HH:mm dd-MM-yyyy"
                          )}
                        </Typography>
                        <Typography mt="5px" variant="h6">
                          <strong>{t("Thời lượng di chuyển")}:</strong>{" "}
                          {trip.duration
                            ? trip.duration + t(" tiếng")
                            : t("Chưa xác định")}
                        </Typography>
                        {/* Thêm thông tin điểm đón và trả */}
                        <Typography mt="5px" variant="h6">
                          <strong>{t("Điểm đón")}:</strong>{" "}
                          {trip.pickUpLocation?.address ?? t("Chưa xác định")}
                        </Typography>
                        <Typography mt="5px" variant="h6">
                          <strong>{t("Điểm trả")}:</strong>{" "}
                          {trip.dropOffLocation?.address ?? t("Chưa xác định")}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          gap="6px"
                          mt="20px"
                          p="6px 10px"
                          borderRadius="30px"
                          bgcolor={colors.primary[400]}
                        >
                          <Typography variant="h5">
                            {/* {getBookingPriceString(trip)} */}
                            {getDiscountedPriceDisplay(trip)}
                          </Typography>
                          <Typography
                            variant="h5"
                            color={colors.greenAccent[400]}
                          >{`\u25CF`}</Typography>
                          <Typography variant="h5">
                            {trip.coach.coachType}
                          </Typography>
                          <Typography
                            variant="h5"
                            color={colors.greenAccent[400]}
                          >{`\u25CF`}</Typography>
                          <Typography variant="h5">
                            {t("Còn lại")}:{" "}
                            {trip.coach.capacity -
                              numberOrderedSeats[trip.id]?.length}{" "}
                            {t("chỗ")}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Box>

                    <Timeline position="right">
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot />
                          <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body1" fontWeight="bold">
                            {trip.source.name}
                          </Typography>
                          <Typography variant="body2" color={colors.grey[300]}>
                          {formatLocation(trip.pickUpLocation)}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                      <TimelineItem>
                        <TimelineSeparator>
                          <TimelineDot />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body1" fontWeight="bold">
                            {trip.destination.name}
                          </Typography>
                          <Typography variant="body2" color={colors.grey[300]}>
                          {formatLocation(trip.dropOffLocation)}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    </Timeline>

                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      {index === selectedItemIndex || values.trip === trip ? (
                        <CheckCircleOutlineOutlinedIcon
                          sx={{ width: "30px", height: "30px" }}
                          color="success"
                        />
                      ) : (
                        <CircleOutlinedIcon
                          sx={{ width: "30px", height: "30px" }}
                        />
                      )}
                      <Typography>{t("Chọn")}</Typography>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          ) : (
            // empty list icon
            <Box
              height="100%"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              sx={{
                color: colors.primary[400],
              }}
            >
              <DoNotDisturbAltOutlinedIcon
                sx={{
                  width: "100px",
                  height: "100px",
                }}
              />
              <Typography variant="h4">{t("Không tìm thấy")}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default TripForm;
