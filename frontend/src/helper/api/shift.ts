import { ModeComment } from "@material-ui/icons";
import { getAxiosInstance } from ".";

export const getShifts = async () => {
  const api = getAxiosInstance()
  const { data } = await api.get("/shifts?order[date]=DESC&order[startTime]=ASC");
  return data;
};

export const getShiftsPerWeek = async (fromDate: Date, toDate: Date) => {

  const api = getAxiosInstance()
  const { data } = await api.get("/shifts?order[date]=DESC&order[startTime]=ASC");
 
  console.log(data.results);

  var dataMap = data.results;

  var listT = [];
  for (var val of dataMap) {
    var objDate = new Date(val.date);

    if ((objDate <= toDate && objDate >= fromDate)) {
      listT.push(val);
    }
  }
  data.results = listT;
  return data;
};

export const getShiftById = async (id: string) => {
  const api = getAxiosInstance()
  const { data } = await api.get(`/shifts/${id}`);
  return data;
};

export const createShifts = async (payload: any) => {
  const api = getAxiosInstance()
  const { data } = await api.post("/shifts", payload);
  return data;
};

export const publishShift = async (payload: any) => {
  const api = getAxiosInstance()
  const { data } = await api.post("/shifts", payload);

  return data;
};

export const updateShiftById = async (id: string, payload: any) => {
  const api = getAxiosInstance()
  const { data } = await api.patch(`/shifts/${id}`, payload);
  return data;
};

export const deleteShiftById = async (id: string) => {
  const api = getAxiosInstance()
  const { data } = await api.delete(`/shifts/${id}`);
  return data;
};