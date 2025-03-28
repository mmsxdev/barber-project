import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  CalendarDays,
  CircleDollarSign,
  PackageSearch,
  TrendingUp,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import { format, startOfDay, endOfDay } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

function WelcomeDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const [summary, setSummary] = useState({
    totalAppointments: 0,
    totalProducts: 0,
    totalIncome: 0,
    todayAppointments: 0,
    lowStockProducts: 0,
    monthlyGrowth: 0,
  });

  // Efeito para animação de entrada
  useEffect(() => {
    // Ativa a animação após um pequeno delay para garantir que o componente esteja renderizado
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Delay de 100ms
    return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
  }, []);

  // Carregar dados do resumo
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const today = new Date();
        const [appointmentsRes, productsRes, financesRes] = await Promise.all([
          api.get("/schedulings"),
          api.get("/produtos"),
          api.get("/finances/summary"),
        ]);

        // Filtrar agendamentos de hoje
        const todayAppointments = appointmentsRes.data.filter((appointment) => {
          const appointmentDate = new Date(appointment.dateTime);
          return (
            appointmentDate >= startOfDay(today) &&
            appointmentDate <= endOfDay(today)
          );
        });

        // Produtos com estoque baixo (menos de 5 unidades)
        const lowStockProducts = productsRes.data.filter(
          (product) => product.quantityInStock < 5
        );

        setSummary({
          totalAppointments: appointmentsRes.data.length,
          totalProducts: productsRes.data.length,
          totalIncome: financesRes.data.totalIncome || 0,
          todayAppointments: todayAppointments.length,
          lowStockProducts: lowStockProducts.length,
          monthlyGrowth: financesRes.data.monthlyGrowth || 0,
        });
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      }
    };

    loadSummary();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  return (
    <div
      className={`h-1/2 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1
            className={`text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-1000 ease-in-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            BarberPRO
          </h1>
          <p
            className={`mt-6 text-xl ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            } transition-all duration-1000 ease-in-out delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            Bem-vindo ao seu painel de controle
          </p>
          <p
            className={`mt-3 text-lg ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            } transition-all duration-1000 ease-in-out delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 ease-in-out delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Total de Agendamentos */}
          <div
            className={`p-6 rounded-2xl border shadow-xl backdrop-blur-lg ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white/80 border-gray-200"
            } hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <CalendarDays className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total de Agendamentos
                </h3>
                <p className="text-2xl font-bold mt-1">
                  {summary.totalAppointments}
                </p>
              </div>
            </div>
          </div>

          {/* Agendamentos Hoje */}
          <div
            className={`p-6 rounded-2xl border shadow-xl backdrop-blur-lg ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white/80 border-gray-200"
            } hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Agendamentos Hoje
                </h3>
                <p className="text-2xl font-bold mt-1">
                  {summary.todayAppointments}
                </p>
              </div>
            </div>
          </div>

          {/* Produtos */}
          <div
            className={`p-6 rounded-2xl border shadow-xl backdrop-blur-lg ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white/80 border-gray-200"
            } hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <PackageSearch className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Produtos</h3>
                <p className="text-2xl font-bold mt-1">
                  {summary.totalProducts}
                </p>
                {summary.lowStockProducts > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {summary.lowStockProducts} com estoque baixo
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Receitas */}
          <div
            className={`p-6 rounded-2xl border shadow-xl backdrop-blur-lg ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white/80 border-gray-200"
            } hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <CircleDollarSign className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Receitas</h3>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(summary.totalIncome)}
                </p>
                <p
                  className={`text-sm ${
                    summary.monthlyGrowth >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  } mt-1`}
                >
                  {formatPercentage(summary.monthlyGrowth)} este mês
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 ease-in-out delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <button
            className={`p-6 rounded-2xl border shadow-lg backdrop-blur-lg text-left group ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-white/80 border-gray-200 hover:bg-white"
            } transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <CalendarDays className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium">Novo Agendamento</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Agende um novo cliente
                </p>
              </div>
            </div>
          </button>

          <button
            className={`p-6 rounded-2xl border shadow-lg backdrop-blur-lg text-left group ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-white/80 border-gray-200 hover:bg-white"
            } transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                <PackageSearch className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium">Gerenciar Produtos</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Controle seu estoque
                </p>
              </div>
            </div>
          </button>

          <button
            className={`p-6 rounded-2xl border shadow-lg backdrop-blur-lg text-left group ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10"
                : "bg-white/80 border-gray-200 hover:bg-white"
            } transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Relatórios</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Visualize suas métricas
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeDashboard;
