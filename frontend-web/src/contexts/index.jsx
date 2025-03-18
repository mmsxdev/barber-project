// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
// Remova a importação do useNavigate

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Remova a linha do navigate

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        console.log("Usuário decodificado:", decoded); // 👈 Adicione este log
        setUser({ id: decoded.id, role: decoded.role });
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
