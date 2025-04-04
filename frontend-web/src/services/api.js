import axios from "axios";

// Cliente API com autenticação (para rotas protegidas)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cliente API sem autenticação (para rotas públicas)
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API URL:", import.meta.env.VITE_API_URL); // Deve mostrar a URL do Railway

// Adiciona o token automaticamente apenas para o cliente autenticado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token sendo enviado:", token); // Debug
  } else {
    console.log("Nenhum token encontrado no localStorage"); // Debug
  }
  return config;
});

// Trata erros globalmente apenas para o cliente autenticado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Erro na requisição:", error.response?.data); // Debug
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Limpa o token inválido
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// O cliente público não redireciona para o login em caso de erro 401
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Erro na requisição pública:", error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
