// src/queries/report/reportQueries.js
import { http } from "../../utils/http";

const getWeeklyPointsReport = async (startDate, endDate) => {
    const response = await http.get("/reports/points/weekly", {
        params: {
            startDate,
            endDate
        }
    });
    return response.data;
};

const getMonthlyPointsReport = async (startDate, endDate) => {
    const response = await http.get("/reports/points/monthly", {
        params: {
            startDate,
            endDate
        }
    });
    return response.data;
};

const getYearlyPointsReport = async (startDate, endDate) => {
    const response = await http.get("/reports/points/yearly", {
        params: {
            startDate,
            endDate
        }
    });
    return response.data;
};

export {
    getWeeklyPointsReport,
    getMonthlyPointsReport,
    getYearlyPointsReport
};
