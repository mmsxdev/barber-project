import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { format, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "../../contexts/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Finance() {
  const [finances, setFinances] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [formData, setFormData] = useState({
    type: "INCOME",
    value: "",
    description: "",
    category: "SERVICE",
    productId: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    type: "",
    category: "",
  });
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { isDarkMode } = useTheme();

  const loadData = useCallback(async () => {
    try {
      const financeParams = new URLSearchParams({
        startDate: filter.startDate,
        endDate: filter.endDate,
        ...(filter.type && { type: filter.type }),
        ...(filter.category && { category: filter.category }),
      });

      const [financesRes, summaryRes, productsRes] = await Promise.all([
        api.get(`/finances?${financeParams}`),
        api.get(`/finances/summary?${financeParams}`),
        api.get("/produtos"),
      ]);

      setFinances(financesRes.data);
      setSummary({
        ...summaryRes.data,
        balance:
          (summaryRes.data.totalIncome || 0) -
          (summaryRes.data.totalExpense || 0),
      });
      setProducts(productsRes.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(err.response?.data?.error || "Erro ao carregar dados");
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        productId:
          formData.category === "PRODUCT_SALE" ? formData.productId : null,
      };

      if (editingId) {
        await api.put(`/finances/${editingId}`, payload);
        setSuccess("Registro atualizado com sucesso!");
      } else {
        await api.post("/finances", payload);
        setSuccess("Registro criado com sucesso!");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setError(err.response?.data?.error || "Erro ao salvar registro");
    } finally {
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "INCOME",
      value: "",
      description: "",
      category: "SERVICE",
      productId: "",
    });
    setEditingId(null);
  };

  const handleEdit = (finance) => {
    setFormData({
      type: finance.type,
      value: finance.value.toString(),
      description: finance.description,
      category: finance.category,
      productId: finance.productId || "",
    });
    setEditingId(finance.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      try {
        await api.delete(`/finances/${id.toString()}`);
        setSuccess("Registro excluído com sucesso!");
        await loadData();
      } catch (error) {
        setError(error.response?.data?.details || "Erro ao excluir registro");
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const chartData = {
    labels: finances.map((f) => formatDate(f.date)),
    datasets: [
      {
        label: "Valor",
        data: finances.map((f) => f.value),
        backgroundColor: finances.map((f) =>
          f.type === "INCOME"
            ? "rgba(75, 192, 192, 0.6)"
            : "rgba(255, 99, 132, 0.6)"
        ),
        borderColor: finances.map((f) =>
          f.type === "INCOME"
            ? "rgba(75, 192, 192, 1)"
            : "rgba(255, 99, 132, 1)"
        ),
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: [
      "Serviços",
      "Produtos",
      "Salários",
      "Aluguel",
      "Manutenção",
      "Outros",
    ],
    datasets: [
      {
        data: [
          finances
            .filter((f) => f.category === "SERVICE")
            .reduce((sum, f) => sum + f.value, 0),
          finances
            .filter((f) => f.category === "PRODUCT_SALE")
            .reduce((sum, f) => sum + f.value, 0),
          finances
            .filter((f) => f.category === "SALARY")
            .reduce((sum, f) => sum + f.value, 0),
          finances
            .filter((f) => f.category === "RENT")
            .reduce((sum, f) => sum + f.value, 0),
          finances
            .filter((f) => f.category === "MAINTENANCE")
            .reduce((sum, f) => sum + f.value, 0),
          finances
            .filter((f) => f.category === "OTHER")
            .reduce((sum, f) => sum + f.value, 0),
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "left",
        align: "center",
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        bodyFont: {
          size: 11,
        },
        titleFont: {
          size: 12,
        },
      },
    },
    layout: {
      margin: {
        left: 10,
        right: 10,
      },
    },
  };

  return (
    <div
      className={`p-1 sm:p-4 md:p-6 min-h-screen w-full overflow-x-hidden ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}
    >
      <div className="max-w-[2000px] mx-auto">
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 md:mb-6 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent animate-fade-in">
          Gestão Financeira
        </h2>

        {/* Alertas */}
        {(error || success) && (
          <div
            className={`fixed top-14 right-2 sm:right-4 p-2.5 sm:p-4 rounded-lg border z-50 ${
              error
                ? "bg-red-500/10 border-red-500/20 text-red-300"
                : "bg-green-500/10 border-green-500/20 text-green-300"
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              {error ? "❌" : "✅"} {error || success}
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-4 mb-2 sm:mb-4 md:mb-6">
          <div
            className={`p-2 sm:p-4 rounded-lg ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200"
            } border shadow-lg`}
          >
            <h3 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
              Receitas
            </h3>
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-green-500">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div
            className={`p-2 sm:p-4 rounded-lg ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200"
            } border shadow-lg`}
          >
            <h3 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
              Despesas
            </h3>
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-red-500">
              {formatCurrency(summary.totalExpense)}
            </p>
          </div>
          <div
            className={`p-2 sm:p-4 rounded-lg ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200"
            } border shadow-lg`}
          >
            <h3 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
              Saldo
            </h3>
            <p
              className={`text-base sm:text-xl lg:text-2xl font-bold ${
                summary.balance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div
          className={`p-2 sm:p-4 rounded-lg mb-2 sm:mb-4 md:mb-6 ${
            isDarkMode
              ? "bg-white/5 border-white/10"
              : "bg-white border-gray-200"
          } border shadow-lg`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-4">
            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Data Inicial
              </label>
              <input
                type="date"
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Data Final
              </label>
              <input
                type="date"
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Tipo
              </label>
              <select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Todos</option>
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </div>
            <div>
              <label
                className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Categoria
              </label>
              <select
                name="category"
                value={filter.category}
                onChange={handleFilterChange}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Todas</option>
                <option value="SERVICE">Serviço</option>
                <option value="PRODUCT_SALE">Produto</option>
                <option value="SALARY">Salário</option>
                <option value="RENT">Aluguel</option>
                <option value="MAINTENANCE">Manutenção</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="mb-2 sm:mb-4 md:mb-6">
          {/* Fluxo de Caixa - Full width */}
          <div
            className={`p-2 sm:p-4 rounded-lg mb-2 sm:mb-4 ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200"
            } border shadow-lg`}
          >
            <h3 className="text-xs sm:text-base lg:text-lg font-semibold mb-1.5 sm:mb-4">
              Fluxo de Caixa
            </h3>
            <div className="w-full h-[200px] sm:h-[300px] lg:h-[400px]">
              <Line data={chartData} />
            </div>
          </div>

          {/* Grid for Formula and Pizza Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-4">
            {/* Formulário */}
            <div
              className={`p-2 sm:p-4 rounded-lg ${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-200"
              } border shadow-lg`}
            >
              <h3 className="text-xs sm:text-base lg:text-lg font-semibold mb-2 sm:mb-4">
                {editingId ? "Editar Registro" : "Novo Registro"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
                <div className="grid grid-cols-1 gap-1.5 sm:gap-4">
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      Tipo
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="INCOME">Receita</option>
                      <option value="EXPENSE">Despesa</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      Valor
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      step="0.01"
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      Descrição
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      Categoria
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    >
                      <option value="SERVICE">Serviço</option>
                      <option value="PRODUCT_SALE">Produto</option>
                      <option value="SALARY">Salário</option>
                      <option value="RENT">Aluguel</option>
                      <option value="MAINTENANCE">Manutenção</option>
                      <option value="OTHER">Outro</option>
                    </select>
                  </div>
                  {formData.category === "PRODUCT_SALE" && (
                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                          isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        Produto
                      </label>
                      <select
                        name="productId"
                        value={formData.productId}
                        onChange={handleInputChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      >
                        <option value="">Selecione um produto</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 sm:gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm"
                  >
                    {editingId ? "Atualizar" : "Criar"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Gráfico de Pizza */}
            <div
              className={`p-2 sm:p-4 rounded-lg ${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-200"
              } border shadow-lg`}
            >
              <h3 className="text-xs sm:text-base lg:text-lg font-semibold mb-1.5 sm:mb-4">
                Distribuição por Categoria
              </h3>
              <div className="flex justify-center items-center">
                <div className="w-full max-w-md h-[200px] sm:h-[300px] lg:h-[400px] px-1 sm:px-4 lg:px-6">
                  <Pie data={categoryData} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        <div
          className={`p-2 sm:p-4 rounded-lg ${
            isDarkMode
              ? "bg-white/5 border-white/10"
              : "bg-white border-gray-200"
          } border shadow-lg overflow-x-auto`}
        >
          <h3 className="text-xs sm:text-base lg:text-lg font-semibold mb-2 sm:mb-4">
            Registros
          </h3>
          <div className="min-w-full">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? "border-white/10" : "border-gray-200"
                  }`}
                >
                  <th className="text-left py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                    Data
                  </th>
                  <th className="text-left py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                    Tipo
                  </th>
                  <th className="hidden sm:table-cell text-left py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                    Categoria
                  </th>
                  <th className="text-left py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                    Descrição
                  </th>
                  <th className="text-right py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                    Valor
                  </th>
                  <th className="text-center py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {finances.map((finance) => (
                  <tr
                    key={finance.id}
                    className={`border-b ${
                      isDarkMode ? "border-white/10" : "border-gray-200"
                    }`}
                  >
                    <td className="py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                      {formatDate(finance.date)}
                    </td>
                    <td className="py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                      <span
                        className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs ${
                          finance.type === "INCOME"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {finance.type === "INCOME" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                      {finance.category}
                    </td>
                    <td className="py-1.5 sm:py-2 px-1.5 sm:px-4 text-xs sm:text-sm">
                      {finance.description}
                    </td>
                    <td
                      className={`py-1.5 sm:py-2 px-1.5 sm:px-4 text-right text-xs sm:text-sm ${
                        finance.type === "INCOME"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatCurrency(finance.value)}
                    </td>
                    <td className="py-1.5 sm:py-2 px-1.5 sm:px-4 text-center text-xs sm:text-sm">
                      <div className="flex justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(finance)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(finance.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
