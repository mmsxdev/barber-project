import { useState } from "react";
import api from "../../services/api";
import { format } from "date-fns";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  Info,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formatType, setFormatType] = useState("excel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Selecione ambas as datas");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        "/reports/monthly",
        {
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          format: formatType,
        },
        { responseType: "blob" }
      );

      const extension = formatType === "excel" ? "xlsx" : "pdf";
      const filename = `relatorio_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.${extension}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro detalhado:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full mx-auto p-6 rounded-xl shadow-lg border ${
        isDarkMode
          ? "bg-gray-800/80 border-gray-700"
          : "bg-white border-gray-100"
      } transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Gerar Relatório Mensal
        </h2>
        <p
          className={`mt-1 text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Selecione o período e formato desejado para o seu relatório
        </p>
      </div>

      <div
        className={`mb-6 p-4 rounded-lg border ${
          isDarkMode
            ? "bg-blue-900/20 border-blue-800"
            : "bg-blue-50 border-blue-100"
        } transition-colors`}
      >
        <div className="flex items-start gap-3">
          <Info
            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <div>
            <h3
              className={`font-medium mb-1 ${
                isDarkMode ? "text-blue-300" : "text-blue-700"
              }`}
            >
              Informações sobre o relatório
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-blue-400/90" : "text-blue-600/80"
              }`}
            >
              Este relatório contém dados consolidados de todas as transações do
              período selecionado, incluindo agendamentos, vendas de produtos e
              serviços realizados.
            </p>
            <ul
              className={`mt-2 text-sm space-y-1 list-disc pl-4 ${
                isDarkMode ? "text-blue-400/90" : "text-blue-600/80"
              }`}
            >
              <li>Resumo financeiro por categoria</li>
              <li>Estatísticas de serviços mais agendados</li>
              <li>Análise de vendas por produtos</li>
              <li>Comparativo com períodos anteriores</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              className={`block text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              } mb-1`}
            >
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`mt-1 block w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              required
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              } mb-1`}
            >
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`mt-1 block w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              required
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            } mb-2`}
          >
            Formato do Relatório
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormatType("excel")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                formatType === "excel"
                  ? isDarkMode
                    ? "border-blue-500 bg-blue-900/20 text-blue-400"
                    : "border-blue-500 bg-blue-50 text-blue-600"
                  : isDarkMode
                  ? "border-gray-600 hover:bg-gray-700/50 text-gray-300"
                  : "border-gray-300 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <FileSpreadsheet className="h-5 w-5" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setFormatType("pdf")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                formatType === "pdf"
                  ? isDarkMode
                    ? "border-purple-500 bg-purple-900/20 text-purple-400"
                    : "border-purple-500 bg-purple-50 text-purple-600"
                  : isDarkMode
                  ? "border-gray-600 hover:bg-gray-700/50 text-gray-300"
                  : "border-gray-300 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            className={`p-3 rounded-lg text-sm border ${
              isDarkMode
                ? "bg-red-900/20 text-red-400 border-red-800/60"
                : "bg-red-50 text-red-600 border-red-100"
            }`}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !startDate || !endDate}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
            loading || !startDate || !endDate
              ? isDarkMode
                ? "bg-gray-700 cursor-not-allowed text-gray-400"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>Gerar Relatório</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportGenerator;
