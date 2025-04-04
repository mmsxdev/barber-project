import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import {
  LogOut,
  Settings,
  CalendarDays,
  CircleDollarSign,
  PackageSearch,
  Sun,
  Moon,
  ClipboardMinus,
  MessageSquare,
} from "lucide-react";

const Sidebar = ({
  handleLogout,
  toggleMenu,
  isMenuOpen,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleManageUsers = () => {
    if (user?.role === "ADMIN") {
      navigate("/listar-usuario");
    } else {
      navigate("/permission-error");
    }
  };

  // Verifica se as permissões estão carregadas
  const checkPermission = (allowedRoles) => {
    if (loading) return true; // Se ainda estiver carregando, permite acesso temporário até verificação completa
    return user && allowedRoles.includes(user.role);
  };

  return (
    <div
      className={`
      fixed inset-y-0 left-0 z-50
      ${
        isDarkMode
          ? "bg-gradient-to-b from-slate-900/80 to-slate-800/80"
          : "bg-gradient-to-b from-white/80 to-gray-50/80"
      } backdrop-blur-lg
      w-64 flex-col pt-8 h-full shadow-xl border-r ${
        isDarkMode ? "border-white/10" : "border-gray-200"
      }
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
    `}
    >
      <div className="px-6 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
          <Link to="/dashboard">Dashboard</Link>
        </h2>
      </div>

      <nav className="space-y-2 px-4">
        {[
          {
            to: "produtos",
            icon: <PackageSearch size={22} />,
            label: "Produtos",
            allowedRoles: ["ADMIN", "SECRETARY"], // Cargos permitidos
          },
          {
            to: "agendamentos",
            icon: <CalendarDays size={22} />,
            label: "Agendamentos",
            allowedRoles: ["ADMIN", "SECRETARY", "BARBER"], // Cargos permitidos
          },
          {
            to: "financas",
            icon: <CircleDollarSign size={22} />,
            label: "Finanças",
            allowedRoles: ["ADMIN", "SECRETARY"], // Cargos permitidos
          },
          {
            to: "relatorios",
            icon: <ClipboardMinus size={22} />,
            label: "Relatórios",
            allowedRoles: ["ADMIN", "SECRETARY"], // Cargos permitidos
          },
        ].map((link) => (
          <div
            key={link.to}
            onClick={() => {
              if (checkPermission(link.allowedRoles)) {
                navigate(`/dashboard?section=${link.to}`); // Permite o acesso
              } else {
                navigate("/dashboard?section=permission-error"); // Redireciona para erro de permissão
              }
              toggleSidebar(); // Fecha o sidebar (em dispositivos móveis)
            }}
            className={`
              ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white hover:bg-black/40 hover:text-blue-500"
                  : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              }
              flex items-center gap-3 p-3 rounded-xl transition-all text-sm md:text-base cursor-pointer
            `}
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </div>
        ))}

        {/* Link específico para a página WhatsApp Admin */}
        {checkPermission(["ADMIN", "SECRETARY"]) && (
          <Link
            to="/whatsapp-admin"
            className={`
              ${
                isDarkMode
                  ? "bg-gradient-to-r from-green-500/30 to-green-600/30 text-white hover:bg-black/40 hover:text-green-400"
                  : "bg-gradient-to-r from-green-500/10 to-green-600/10 text-gray-700 hover:bg-gray-100 hover:text-green-600"
              }
              flex items-center gap-3 p-3 rounded-xl transition-all text-sm md:text-base cursor-pointer
            `}
            onClick={toggleSidebar}
          >
            <MessageSquare size={22} />
            <span className="font-medium">WhatsApp</span>
          </Link>
        )}
      </nav>

      <div className="absolute bottom-6 w-full px-4 space-y-3">
        {isMenuOpen && (
          <div
            className={`fixed bottom-48 ml-0 ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-400"
            } backdrop-blur-lg rounded-xl shadow-2xl min-w-[224px] border lg:ml-0`}
          >
            <div
              onClick={handleManageUsers}
              className={`p-3 rounded-lg ${
                isDarkMode
                  ? "hover:bg-white/10 text-slate-200"
                  : "hover:bg-gray-200 text-gray-700"
              } cursor-pointer transition-colors flex items-center gap-2`}
            >
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Gerenciar Usuários
            </div>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm md:text-base ${
            isDarkMode
              ? "text-white hover:bg-white/5 hover:text-blue-400"
              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
          }`}
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          <span className="font-medium">
            {isDarkMode ? "Tema Claro" : "Tema Escuro"}
          </span>
        </button>

        <button
          onClick={toggleMenu}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm md:text-base ${
            isMenuOpen
              ? "bg-blue-500/30 text-white"
              : isDarkMode
              ? "text-white hover:bg-white/5 hover:text-blue-400"
              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
          }`}
        >
          <Settings size={22} />
          <span className="font-medium">Configurações</span>
        </button>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 p-3 rounded-xl ${
            isDarkMode
              ? "text-white hover:bg-red-500/20 hover:text-red-300"
              : "text-gray-700 hover:bg-red-50 hover:text-red-600"
          } transition-all text-sm md:text-base`}
        >
          <LogOut size={22} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  handleLogout: PropTypes.func.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
