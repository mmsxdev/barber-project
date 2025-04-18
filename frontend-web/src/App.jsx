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
import WhatsAppAdmin from "./pages/WhatsAppAdmin";
import CommissionsPage from "./pages/Commissions";
import { ClientList } from "./components/ClientList";
import { ServiceList } from "./components/ServiceList";
import { FontOptimizer } from "./components/FontOptimizer";

function App() {
  return (
    <FontOptimizer>
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
                <Route path="/whatsapp-admin" element={<WhatsAppAdmin />} />
                <Route path="/servicos" element={<ServiceList/>} />
                <Route path="/clientes" element={<ClientList/>} />
                <Route path="/comissoes" element={<CommissionsPage />} />
              </Routes>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </div>
    </FontOptimizer>
  );
}

export default App;
