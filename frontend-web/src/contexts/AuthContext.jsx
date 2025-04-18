// src/contexts/AuthContext.jsx
import { useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContextProvider";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para recarregar o usuário sob demanda
  const refreshUser = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        console.log("Usuário decodificado:", decoded);
        setUser({ id: decoded.id, role: decoded.role });
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
    return !!token;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
