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
  const [useAI, setUseAI] = useState(false); // Novo estado para a opção de IA
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
          useAI,
        },
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/json, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      // Check if response is JSON (error)
      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        setError(errorData.error || "Erro ao gerar relatório");
        return;
      }

      // If not error, process download
      const extension = formatType === "excel" ? "xlsx" : "pdf";
      const filename = `relatorio_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.${extension}`;

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro detalhado:", err);

      // Try to read error message from blob if available
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          setError(errorData.error || "Erro ao gerar relatório");
        } catch {
          setError("Erro ao gerar relatório. Por favor, tente novamente.");
        }
      } else {
        setError("Erro ao gerar relatório. Por favor, tente novamente.");
      }
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
            Deseja incluir insights gerados por IA?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUseAI(true)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                useAI
                  ? "border-blue-500 bg-blue-500/10 text-blue-500"
                  : isDarkMode
                  ? "border-gray-700 bg-gray-800 text-gray-400 hover:border-blue-500/50 hover:text-blue-400"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-500/50 hover:text-blue-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className={`w-6 h-6 ${
                    useAI ? "text-blue-500" : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-medium">Sim</span>
                <span className="text-xs text-center opacity-75">
                  Análise inteligente dos dados
                </span>
              </div>
              {useAI && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Ativo
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setUseAI(false)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                !useAI
                  ? "border-gray-500 bg-gray-500/10 text-gray-500"
                  : isDarkMode
                  ? "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500/50 hover:text-gray-300"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-500/50 hover:text-gray-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className={`w-6 h-6 ${
                    !useAI ? "text-gray-500" : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="font-medium">Não</span>
                <span className="text-xs text-center opacity-75">
                  Apenas dados brutos
                </span>
              </div>
              {!useAI && (
                <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  Padrão
                </div>
              )}
            </button>
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
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormatType("excel")}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                formatType === "excel"
                  ? "border-green-500 bg-green-500/10 text-green-500"
                  : isDarkMode
                  ? "border-gray-700 bg-gray-800 text-gray-400 hover:border-green-500/50 hover:text-green-400"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-green-500/50 hover:text-green-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet
                  className={`w-6 h-6 ${
                    formatType === "excel" ? "text-green-500" : "text-gray-400"
                  }`}
                />
                <span className="font-medium">Excel</span>
                <span className="text-xs text-center opacity-75">
                  Planilha interativa
                </span>
              </div>
              {formatType === "excel" && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Selecionado
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFormatType("pdf")}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                formatType === "pdf"
                  ? "border-red-500 bg-red-500/10 text-red-500"
                  : isDarkMode
                  ? "border-gray-700 bg-gray-800 text-gray-400 hover:border-red-500/50 hover:text-red-400"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-red-500/50 hover:text-red-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <FileText
                  className={`w-6 h-6 ${
                    formatType === "pdf" ? "text-red-500" : "text-gray-400"
                  }`}
                />
                <span className="font-medium">PDF</span>
                <span className="text-xs text-center opacity-75">
                  Documento formatado
                </span>
              </div>
              {formatType === "pdf" && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Selecionado
                </div>
              )}
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
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Gerando relatório...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              <span>Gerar Relatório</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportGenerator;
