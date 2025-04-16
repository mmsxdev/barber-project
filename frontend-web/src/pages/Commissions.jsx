import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CommissionReport } from "../components/CommissionReport";
import { EditCommissions } from "../components/EditCommissions";
import { userService } from "../services/businessServices";
import { useTheme } from "../contexts/ThemeContext";
import { ArrowLeft, Edit } from "lucide-react";

export default function Commissions() {
  const { isDarkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedBarber, setSelectedBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isEditMode = searchParams.get("mode") === "edit";

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    const barberIdFromParams = searchParams.get("barberId");
    if (barberIdFromParams && barberIdFromParams !== selectedBarber) {
      setSelectedBarber(barberIdFromParams);
    } else if (!barberIdFromParams && barbers.length > 0 && !selectedBarber) {
      const firstBarberId = barbers[0].id;
      setSelectedBarber(firstBarberId);
      setSearchParams({ barberId: firstBarberId }, { replace: true });
    }
  }, [searchParams, barbers, selectedBarber, setSearchParams]);

  const fetchBarbers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getByRole("BARBER");
      setBarbers(data);
    } catch (error) {
      console.error("Erro ao carregar barbeiros:", error);
      setError("Não foi possível carregar os barbeiros.");
    } finally {
      setLoading(false);
    }
  };

  const handleBarberChange = (e) => {
    const newBarberId = e.target.value;
    setSelectedBarber(newBarberId);
    setSearchParams(
      { mode: isEditMode ? "edit" : "", barberId: newBarberId || "" },
      { replace: true }
    );
  };

  const navigateToEdit = () => {
    setSearchParams(
      { mode: "edit", barberId: selectedBarber },
      { replace: true }
    );
  };

  const navigateToReport = () => {
    setSearchParams({ barberId: selectedBarber }, { replace: true });
  };

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 min-h-screen space-y-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            title="Voltar ao Dashboard"
            className={`p-1.5 rounded-full transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {isEditMode ? "Editar Comissões" : "Relatório de Comissões"}
            </h1>
            <p
              className={`mt-1 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {isEditMode
                ? "Defina as taxas de comissão"
                : "Visualize as comissões dos barbeiros"}
            </p>
          </div>
        </div>
        {!isEditMode && selectedBarber && (
          <button
            onClick={navigateToEdit}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-transparent rounded-lg shadow-md text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <Edit size={16} /> Editar Taxas
          </button>
        )}
      </div>

      {error && (
        <div
          className={`p-4 border rounded-lg shadow-sm text-sm ${
            isDarkMode
              ? "bg-red-900/20 border-red-700/30 text-red-300"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {error}
        </div>
      )}

      <div
        className={`p-4 sm:p-6 rounded-xl border shadow-lg ${
          isDarkMode
            ? "bg-gray-800/80 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <label
          htmlFor="barber"
          className={`block text-sm font-medium mb-1.5 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Barbeiro Selecionado
        </label>
        <select
          id="barber"
          value={selectedBarber || ""}
          onChange={handleBarberChange}
          className={`block w-full rounded-lg border p-1 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
          }`}
          disabled={loading || barbers.length === 0}
        >
          <option value="">
            {loading
              ? "Carregando..."
              : barbers.length === 0
              ? "Nenhum barbeiro"
              : "Selecione um barbeiro"}
          </option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {selectedBarber ? (
          isEditMode ? (
            <EditCommissions
              barberId={selectedBarber}
              onBack={navigateToReport}
            />
          ) : (
            <CommissionReport barberId={selectedBarber} />
          )
        ) : (
          !loading &&
          barbers.length > 0 && (
            <div
              className={`text-center p-6 rounded-xl border shadow-lg ${
                isDarkMode
                  ? "bg-gray-800/80 border-gray-700 text-gray-400"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              Selecione um barbeiro para visualizar o relatório ou editar as
              comissões.
            </div>
          )
        )}
      </div>
    </div>
  );
}
