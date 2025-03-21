import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Adiciona o token ao cabeçalho de todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Supondo que o token esteja salvo no localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
