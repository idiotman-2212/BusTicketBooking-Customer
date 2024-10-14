import { http } from "../../utils/http";

const getAllCargos = async ()  =>{
    const response = await http.get("/cargos/all");
    return response.data
};

export {getAllCargos}