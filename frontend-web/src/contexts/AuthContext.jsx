// src/contexts/AuthContext.jsx
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextProvider";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          console.log("Usuário decodificado:", decoded);
          setUser({ id: decoded.id, role: decoded.role });
        } catch (error) {
          console.error("Erro ao decodificar token:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
