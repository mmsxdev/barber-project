import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/DashBoard";
import UsersList from "./pages/Listar Usuarios";
import UsersDelete from "./pages/Deletar Usuarios";
import UsersEdit from "./pages/Editar Usuarios";
import ClientScheduling from "./pages/ClientScheduling";
import { AuthProvider } from "./contexts/AuthContext";
import { PermissionError } from "./components/PermissionError";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <div className="">
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deletar-usuario/:cpf" element={<UsersDelete />} />
              <Route path="/listar-usuario/" element={<UsersList />} />
              <Route path="/editar-usuario/:cpf" element={<UsersEdit />} />
              <Route path="/agendar" element={<ClientScheduling />} />
              <Route path="/permission-error" element={<PermissionError />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
