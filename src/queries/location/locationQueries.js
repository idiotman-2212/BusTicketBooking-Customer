import { http } from "../../utils/http";

const getAllLocations = async () => {
    const resp = await http.get("/locations/all");
    return resp.data;
};

const getLocationById = async (id) => {
    const resp = await http.get(`/locations/${id}`);
    return resp.data;
};

const getLocationsByProvinceId = async (provinceId) => {
    const resp = await http.get(`/locations/province/${provinceId}`);
    return resp.data;
};

export {
    getAllLocations,
    getLocationById,
    getLocationsByProvinceId
};
