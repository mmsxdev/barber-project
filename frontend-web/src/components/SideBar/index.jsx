import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/index";
import {
  LogOut,
  Settings,
  CalendarDays,
  CircleDollarSign,
  PackageSearch,
} from "lucide-react";
const Sidebar = ({
  handleLogout,
  toggleMenu,
  isMenuOpen,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleManageUsers = () => {
    if (user?.role === "ADMIN") {
      navigate("/listar-usuario"); // 👈 Redireciona para a página de listagem
    } else {
      navigate("/permission-error");
    }
  };

  return (
    <div
      className={`
      fixed inset-y-0 left-0 z-50
      bg-gradient-to-b from-slate-900/80 to-slate-800/80 backdrop-blur-lg
      w-64 text-white flex-col pt-8 h-full shadow-xl border-r border-white/10
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
    `}
    >
      <div className="px-6 mb-12">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
          BarberDashboard
        </h2>
      </div>

      <nav className="space-y-2 px-4">
        {[
          {
            to: "produtos",
            icon: <PackageSearch size={22} />,
            label: "Produtos",
          },
          {
            to: "agendamentos",
            icon: <CalendarDays size={22} />,
            label: "Agendamentos",
          },
          {
            to: "financas",
            icon: <CircleDollarSign size={22} />,
            label: "Finanças",
          },
        ].map((link) => (
          <NavLink
            key={link.to}
            to={`/dashboard?section=${link.to}`}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition-all text-sm md:text-base ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white"
                  : "hover:bg-white/5 hover:text-blue-400"
              }`
            }
            onClick={toggleSidebar}
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 w-full px-4 space-y-3">
        {isMenuOpen && (
          <div className="fixed bottom-33 ml-0 bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl min-w-[224px] border border-white/10 lg:ml-0">
            <div
              onClick={handleManageUsers}
              className="p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-slate-200 flex items-center gap-2"
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
          onClick={toggleMenu}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm md:text-base ${
            isMenuOpen
              ? "bg-blue-500/30 text-white"
              : "hover:bg-white/5 hover:text-blue-400"
          }`}
        >
          <Settings size={22} />
          <span className="font-medium">Configurações</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all text-sm md:text-base"
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
