import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", //  cambiar al backend real después
  headers: {
    "Content-Type": "application/json",
  },
});
