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

  const loadData = useCallback(async () => {
    try {
      const financeParams = new URLSearchParams({
        startDate: filter.startDate,
        endDate: filter.endDate,
        ...(filter.type && { type: filter.type }),
        ...(filter.category && { category: filter.category }),
      });

      console.log("URL da requisição:", `/finances?${financeParams}`); // Adicione esta linha

      const [financesRes, summaryRes, productsRes] = await Promise.all([
        api.get(`/finances?${financeParams}`),
        api.get(`/finances/summary?${financeParams}`),
        api.get("/produtos"),
      ]);

      console.log("Dados recebidos - Finanças:", financesRes.data); // Adicione esta linha
      console.log("Dados recebidos - Resumo:", summaryRes.data); // Adicione esta linha
      console.log("Dados recebidos - Produtos:", productsRes.data); // Adicione esta linha

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
        await api.delete(`/finances/${id}`);
        setSuccess("Registro excluído com sucesso!");
        await loadData();
      } catch (error) {
        error && setError("Erro ao excluir registro");
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

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent animate-fade-in">
        Gestão Financeira
      </h2>

      {/* Mensagens de status */}
      <div className="space-y-4 mb-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-4 rounded-lg animate-fade-in">
            {success}
          </div>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Receitas", value: summary.totalIncome, color: "green" },
          { title: "Despesas", value: summary.totalExpense, color: "red" },
          {
            title: "Saldo",
            value: summary.balance,
            color: summary.balance >= 0 ? "green" : "red",
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${`bg-${item.color}-500/10 border-${item.color}-500/20`}`}
          >
            <h3 className="text-sm text-gray-300 mb-1">{item.title}</h3>
            <p className="text-xl md:text-2xl font-bold">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white/5 p-4 rounded-lg border border-white/10 transition-all duration-300 hover:border-white/20">
          <h3 className="text-lg font-semibold mb-4">Fluxo Financeiro</h3>
          <div className="h-64 md:h-80">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: "#fff" },
                  },
                },
                scales: {
                  x: {
                    ticks: { color: "#fff" },
                    grid: { color: "rgba(255,255,255,0.1)" },
                  },
                  y: {
                    ticks: { color: "#fff" },
                    grid: { color: "rgba(255,255,255,0.1)" },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/10 transition-all duration-300 hover:border-white/20">
          <h3 className="text-lg font-semibold mb-4">
            Distribuição por Categoria
          </h3>
          <div className="h-64 md:h-80">
            <Pie
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: "#fff" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Formulário e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Formulário */}
        <div className="lg:col-span-1 bg-white/5 p-4 md:p-6 rounded-xl border border-white/10 transition-all duration-300 h-full flex flex-col">
          {/* Header com efeito de gradiente */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-center">
              <span className="bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
                {editingId ? "✏️ Editar Registro" : "✨ Novo Registro"}
              </span>
            </h3>
            <div className="mt-2 mb-4 h-[2px] bg-gradient-to-r from-blue-400/30 to-purple-400/30 w-3/4 mx-auto"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Tipo *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  required
                >
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Categoria *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  required
                >
                  <option value="SERVICE">Serviço</option>
                  <option value="PRODUCT_SALE">Venda</option>
                  <option value="SALARY">Salário</option>
                  <option value="RENT">Aluguel</option>
                  <option value="MAINTENANCE">Manutenção</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              {/* Campo de Valor */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Valor *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Campo de Descrição */}
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  required
                />
              </div>

              {/* Seletor de Produto */}
              {formData.type === "INCOME" &&
                formData.category === "PRODUCT_SALE" && (
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Produto *
                    </label>
                    <select
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                      required
                    >
                      <option value="">Selecione um produto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>

            {/* Botões fixos na base */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingId ? "Atualizar" : "Adicionar"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 bg-slate-700 text-slate-300 py-2 rounded-lg font-medium hover:bg-slate-600 transition-all"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-3 bg-white/5 p-6 rounded-lg border border-white/10">
          {/* Cabeçalho com filtros */}
          <div className="flex flex-col gap-4 mb-4">
            <h3 className="text-lg font-semibold">Registros Financeiros</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 w-full">
              <input
                type="date"
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
                className="p-2 rounded bg-white/5 border border-white/10 text-sm focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="date"
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
                className="p-2 rounded bg-white/5 border border-white/10 text-sm focus:ring-2 focus:ring-blue-400"
              />
              <select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="p-2 rounded bg-white/5 border border-white/10 text-sm focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todos tipos</option>
                <option value="INCOME">Receitas</option>
                <option value="EXPENSE">Despesas</option>
              </select>
              <select
                name="category"
                value={filter.category}
                onChange={handleFilterChange}
                className="p-2 rounded bg-white/5 border border-white/10 text-sm focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Todas categorias</option>
                <option value="SERVICE">Serviço</option>
                <option value="PRODUCT_SALE">Venda</option>
                <option value="SALARY">Salário</option>
                <option value="RENT">Aluguel</option>
                <option value="MAINTENANCE">Manutenção</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-2 md:p-3 text-left text-sm md:text-base">
                    Data
                  </th>
                  <th className="p-2 md:p-3 text-left text-sm md:text-base">
                    Tipo
                  </th>
                  <th className="p-2 md:p-3 text-left text-sm md:text-base">
                    Categoria
                  </th>
                  <th className="p-2 md:p-3 text-left text-sm md:text-base">
                    Descrição
                  </th>
                  <th className="p-2 md:p-3 text-left text-sm md:text-base">
                    Produto
                  </th>
                  <th className="p-2 md:p-3 text-right text-sm md:text-base">
                    Valor
                  </th>
                  <th className="p-2 md:p-3 text-right text-sm md:text-base">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {finances.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-3 text-center text-sm md:text-base"
                    >
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  finances.map((finance) => (
                    <tr
                      key={finance.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-2 md:p-3 whitespace-nowrap text-sm md:text-base">
                        {formatDate(finance.date)}
                      </td>
                      <td className="p-2 md:p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            finance.type === "INCOME"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {finance.type === "INCOME" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-sm md:text-base max-w-[120px] truncate">
                        {finance.category}
                      </td>
                      <td className="p-2 md:p-3 text-sm md:text-base max-w-[150px] truncate">
                        {finance.description}
                      </td>
                      <td className="p-2 md:p-3 text-sm md:text-base max-w-[100px] truncate">
                        {finance.product?.name || "-"}
                      </td>
                      <td
                        className={`p-2 md:p-3 text-right text-sm md:text-base ${
                          finance.type === "INCOME"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        {formatCurrency(finance.value)}
                      </td>
                      <td className="p-2 md:p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(finance)}
                            className="text-blue-400 hover:text-blue-300 text-sm md:text-base px-2 py-1 rounded hover:bg-white/10 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(finance.id)}
                            className="text-red-400 hover:text-red-300 text-sm md:text-base px-2 py-1 rounded hover:bg-white/10 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
