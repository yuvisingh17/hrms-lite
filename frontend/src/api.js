import axios from "axios";

export const api = axios.create({
  baseURL: "https://hrms-backend-v4i2.onrender.com"
});
