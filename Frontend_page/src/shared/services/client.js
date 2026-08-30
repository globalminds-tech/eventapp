import axiosClient from "../api/axiosClient";
import { ENV } from "../../config/env";

export const BASE_URL = ENV.API_BASE_URL;
export const apiClient = axiosClient;
export default axiosClient;
