import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Sidebar from "../../components/SideBar/index.jsx";
import Loading from "../../components/Loading";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/useAuth";

// Importações lazy
const ProdutosSection = lazy(() => import("../../components/Products"));
const AgendamentosSection = lazy(() => import("../../components/Schedule"));
const RelatoriosSection = lazy(() =>
  import("../../components/ReportGenerator")
);
const FinancasSection = lazy(() =>
  import("../../components/FinancesManagement")
);
const PermissionError = lazy(() => import("../../components/PermissionError"));
const BoasVindasSection = lazy(() =>
  import("../../components/WelcomeDashboard")
);

function Dashboard() {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") || "boas-vindas"; // Seção padrão é "boas-vindas"
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Função para verificar permissões
  const hasPermission = (requiredRoles) => {
    if (loading) return true; // Permite acesso durante carregamento
    return user && requiredRoles.includes(user.role);
  };

  const renderSection = () => {
    // Se estiver carregando, mostra um spinner
    if (loading) {
      return <Loading message="Carregando..." />;
    }

    switch (section) {
      case "produtos":
        return hasPermission(["ADMIN", "SECRETARY"]) ? (
          <Suspense fallback={<Loading message="Carregando produtos..." />}>
            <ProdutosSection />
          </Suspense>
        ) : (
          <PermissionError />
        );
      case "agendamentos":
        return hasPermission(["ADMIN", "SECRETARY", "BARBER"]) ? (
          <Suspense fallback={<Loading message="Carregando agendamentos..." />}>
            <AgendamentosSection />
          </Suspense>
        ) : (
          <PermissionError />
        );
      case "financas":
        return hasPermission(["ADMIN", "SECRETARY"]) ? (
          <Suspense fallback={<Loading message="Carregando finanças..." />}>
            <FinancasSection />
          </Suspense>
        ) : (
          <PermissionError />
        );
      case "relatorios":
        return hasPermission(["ADMIN", "SECRETARY"]) ? (
          <Suspense fallback={<Loading message="Carregando relatorios..." />}>
            <RelatoriosSection />
          </Suspense>
        ) : (
          <PermissionError />
        );
      case "permission-error":
        return (
          <Suspense fallback={<Loading message="Carregando Erro..." />}>
            <PermissionError />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<Loading />}>
            <BoasVindasSection /> {/* Seção padrão */}
          </Suspense>
        );
    }
  };

  return (
    <div
      className={`flex min-h-screen relative ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-gray-50 to-white"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          isDarkMode
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } focus:outline-none`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <Sidebar
        handleLogout={handleLogout}
        toggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <main
        className={`flex-grow p-6 ml-0 transition-all md:p-8 lg:ml-64 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {user?.role === "ADMIN" && (
            <div className="mb-4">
              <Link
                to="/admin/whatsapp"
                className={`inline-flex items-center p-3 rounded-lg mb-2 ${
                  isDarkMode
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    : "bg-white hover:bg-gray-100 text-gray-700 shadow-sm"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.333-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.333 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                </svg>
                <span>Configuração do WhatsApp</span>
              </Link>
            </div>
          )}
          <Suspense fallback={<Loading />}>{renderSection()}</Suspense>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
