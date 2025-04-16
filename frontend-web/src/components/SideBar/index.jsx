import { useState } from "react";
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
  ClipboardList,
  MessageSquare,
  Scissors,
  Users,
  ChevronDown,
  ChevronRight,
  Home,
  Award,
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
  const [expandedCategory, setExpandedCategory] = useState("dashboard");

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

  // Menus agrupados por categoria
  const menuCategories = [
    {
      id: "dashboard",
      label: "Principal",
      icon: <Home size={20} />,
      items: [
        {
          to: "boas-vindas",
          icon: <Home size={20} />,
          label: "Início",
          allowedRoles: ["ADMIN", "SECRETARY", "BARBER"],
        },
        {
          to: "agendamentos",
          icon: <CalendarDays size={20} />,
          label: "Agendamentos",
          allowedRoles: ["ADMIN", "SECRETARY", "BARBER"],
        },
      ],
    },
    {
      id: "cadastros",
      label: "Cadastros",
      icon: <Users size={20} />,
      items: [
        {
          to: "clientes",
          icon: <Users size={20} />,
          label: "Clientes",
          allowedRoles: ["ADMIN", "SECRETARY"],
          isExternalRoute: true,
        },
        {
          to: "servicos",
          icon: <Scissors size={20} />,
          label: "Serviços",
          allowedRoles: ["ADMIN", "SECRETARY"],
          isExternalRoute: true,
        },
        {
          to: "produtos",
          icon: <PackageSearch size={20} />,
          label: "Produtos",
          allowedRoles: ["ADMIN", "SECRETARY"],
        },
      ],
    },
    {
      id: "financeiro",
      label: "Financeiro",
      icon: <CircleDollarSign size={20} />,
      items: [
        {
          to: "financas",
          icon: <CircleDollarSign size={20} />,
          label: "Controle",
          allowedRoles: ["ADMIN", "SECRETARY"],
        },
        {
          to: "relatorios",
          icon: <ClipboardList size={20} />,
          label: "Relatórios",
          allowedRoles: ["ADMIN", "SECRETARY"],
        },
        {
          to: "comissoes",
          icon: <CircleDollarSign size={20} />,
          label: "Comissões",
          allowedRoles: ["ADMIN", "SECRETARY"],
          isExternalRoute: true,
        },
      ],
    },
    {
      id: "outros",
      label: "Outros",
      icon: <Award size={20} />,
      items: [
        {
          to: "whatsapp-admin",
          icon: <MessageSquare size={20} />,
          label: "WhatsApp",
          allowedRoles: ["ADMIN", "SECRETARY"],
          isExternalRoute: true,
        },
      ],
    },
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div
      className={`
      fixed inset-y-0 left-0 z-50
      ${
        isDarkMode
          ? "bg-gradient-to-b from-slate-900/95 to-slate-800/95"
          : "bg-gradient-to-b from-white/95 to-gray-50/95"
      } backdrop-blur-lg
      w-64 flex-col pt-6 h-full shadow-xl border-r ${
        isDarkMode ? "border-white/10" : "border-gray-200"
      }
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 overflow-y-auto
    `}
    >
      <div className="px-6 mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
          <Link to="/dashboard">Barbearia</Link>
        </h2>
      </div>

      <nav className="space-y-1 px-3">
        {menuCategories.map((category) => {
          // Filtrar itens pelo papel do usuário
          const visibleItems = category.items.filter((item) =>
            checkPermission(item.allowedRoles)
          );
          
          // Não mostrar categorias vazias
          if (visibleItems.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className={`
                  w-full flex items-center justify-between p-2.5 rounded-lg
                  ${
                    isDarkMode
                      ? "hover:bg-white/10 text-gray-200"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                  transition-colors duration-200 mb-1 font-medium
                `}
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span>{category.label}</span>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              
              {expandedCategory === category.id && (
                <div className="pl-4 space-y-1">
                  {visibleItems.map((item) => (
                    <div
                      key={item.to}
                      onClick={() => {
                        if (checkPermission(item.allowedRoles)) {
                          if (item.isExternalRoute) {
                            navigate(`/${item.to}`);
                          } else {
                            navigate(`/dashboard?section=${item.to}`);
                          }
                          if (window.innerWidth < 1024) {
                            toggleSidebar();
                          }
                        } else {
                          navigate("/dashboard?section=permission-error");
                        }
                      }}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer
                        ${
                          isDarkMode
                            ? "hover:bg-white/10 text-gray-300"
                            : "hover:bg-gray-100 text-gray-600"
                        }
                        transition-colors duration-200 text-sm
                      `}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="absolute bottom-6 w-full px-4 space-y-2">
        {isMenuOpen && checkPermission(["ADMIN"]) && (
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
              <Users size={18} className="text-blue-500" />
              Gerenciar Usuários
            </div>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm ${
            isDarkMode
              ? "text-white hover:bg-white/5 hover:text-blue-400"
              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
          }`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">
            {isDarkMode ? "Tema Claro" : "Tema Escuro"}
          </span>
        </button>

        <button
          onClick={toggleMenu}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm ${
            isMenuOpen
              ? "bg-blue-500/30 text-white"
              : isDarkMode
              ? "text-white hover:bg-white/5 hover:text-blue-400"
              : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Configurações</span>
        </button>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg ${
            isDarkMode
              ? "text-white hover:bg-red-500/20 hover:text-red-300"
              : "text-gray-700 hover:bg-red-50 hover:text-red-600"
          } transition-all text-sm`}
        >
          <LogOut size={20} />
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
