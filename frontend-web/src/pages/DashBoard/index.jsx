import { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/SideBar/index.jsx";
import Loading from "../../components/Loading";

// Importações lazy
const ProdutosSection = lazy(() => import("../../components/Products"));
const AgendamentosSection = lazy(() => import("../../components/Schedule"));
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

  const renderSection = () => {
    switch (section) {
      case "produtos":
        return (
          <Suspense fallback={<Loading message="Carregando produtos..." />}>
            <ProdutosSection />
          </Suspense>
        );
      case "agendamentos":
        return (
          <Suspense fallback={<Loading message="Carregando agendamentos..." />}>
            <AgendamentosSection />
          </Suspense>
        );
      case "financas":
        return (
          <Suspense fallback={<Loading message="Carregando finanças..." />}>
            <FinancasSection />
          </Suspense>
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative">
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 focus:outline-none"
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

      <main className="flex-grow p-6 ml-0 transition-all md:p-8 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<Loading />}>{renderSection()}</Suspense>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
