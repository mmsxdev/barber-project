import React, { useState, useEffect } from 'react';
import { commissionService, serviceService } from '../services/businessServices';
import axios from 'axios';
import { useTheme } from "../contexts/ThemeContext"
import { Save } from 'lucide-react';

export const EditCommissions = ({ barberId, onBack }) => {
  const { isDarkMode } = useTheme();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingState, setSavingState] = useState({});

  useEffect(() => {
    fetchData();
  }, [barberId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSavingState({});
    try {
      const [servicesData, commissionsData] = await Promise.all([
        serviceService.list({ active: true }),
        commissionService.getBarberCommissions(barberId)
      ]);

      const mappedCommissions = servicesData.map(service => {
        const currentCommission = commissionsData.find(c => c.serviceId === service.id);
        return {
          serviceId: service.id,
          name: service.name,
          percentage: currentCommission?.percentage?.toString() || '0'
        };
      });

      setCommissions(mappedCommissions);

    } catch (err) {
      console.error('Erro ao carregar dados de comissão:', err);
      setError('Erro ao carregar dados para edição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (serviceId, value) => {
    let cleanValue = value.replace(/[^\d.]/g, '');
    const floatVal = parseFloat(cleanValue);
    if (cleanValue !== '' && !isNaN(floatVal)) {
        if (floatVal > 100) cleanValue = '100';
        else if (floatVal < 0) cleanValue = '0';
        else if (cleanValue.startsWith('.')) cleanValue = '0' + cleanValue;
        else if (cleanValue.includes('.')) {
            const parts = cleanValue.split('.');
            if (parts[1] && parts[1].length > 1) {
                cleanValue = `${parts[0]}.${parts[1].substring(0,1)}`;
            }
        }
    } else if (cleanValue !== '' && cleanValue !== '.') {
        cleanValue = '0';
    }
    
    setCommissions(prev =>
      prev.map(c => (c.serviceId === serviceId ? { ...c, percentage: cleanValue } : c))
    );
  };

  const handleSave = async (serviceId) => {
    const commissionToSave = commissions.find(c => c.serviceId === serviceId);
    if (!commissionToSave) return;

    setSavingState(prev => ({ ...prev, [serviceId]: true }));
    setError(null);
    try {
      const percentageValue = parseFloat(commissionToSave.percentage) || 0;
      
      if (percentageValue < 0 || percentageValue > 100) {
        throw new Error('Porcentagem inválida.');
      }

      await commissionService.setCommissionRate(
        barberId,
        serviceId,
        percentageValue
      );
    } catch (err) {
      console.error('Erro ao salvar comissão:', err);
      setError(err.message || 'Erro ao salvar taxa.');
    } finally {
      setSavingState(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-60 rounded-xl border shadow-lg p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        Carregando taxas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`p-4 sm:p-6 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Editar Taxas de Comissão</h2>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ajuste as porcentagens (%) e salve por serviço.</p>
          </div>
          <button 
            onClick={onBack} 
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 focus:ring-offset-gray-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white'}`}
          >
            Voltar ao Relatório
          </button>
        </div>
      </div>

      {error && (
        <div className={`p-4 border rounded-xl shadow-sm text-sm ${isDarkMode ? 'bg-red-900/20 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className={`rounded-xl border shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold px-4 pt-4 sm:px-6 sm:pt-5 mb-0 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Taxas por Serviço</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Serviço</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Taxa (%)</th>
                <th className={`w-28 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {commissions.map((commission) => {
                const isSaving = savingState[commission.serviceId] || false;
                return (
                  <tr key={commission.serviceId} className={`${isDarkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {commission.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={commission.percentage}
                        onChange={(e) => handlePercentageChange(commission.serviceId, e.target.value)}
                        className={`w-24 rounded-lg px-1 border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`}
                        placeholder="0.0"
                        aria-label={`Taxa de comissão para ${commission.name}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleSave(commission.serviceId)}
                        disabled={isSaving}
                        className={`w-24 inline-flex justify-center items-center gap-1.5 px-3 py-1.5 border border-transparent rounded-lg shadow-md text-white text-xs sm:text-sm font-medium transition-colors duration-150 ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800'}`}
                      >
                        {isSaving ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : <><Save size={14}/> Salvar</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {commissions.length === 0 && !loading && (
              <div className={`text-center py-10 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Não há serviços ativos para configurar comissão.
              </div>
          )}
        </div>
      </div>
    </div>
  );
}; 