import React, { useState, useEffect } from 'react';
import { commissionService } from '../services/businessServices';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { useTheme } from "./../contexts/ThemeContext";

// Helper para formatação de moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Helper para formatação de data
const formatDate = (date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error("Erro ao formatar data:", date, e);
    return 'Erro data';
  }
};

export const CommissionReport = ({ barberId }) => {
  const { isDarkMode } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchReport();
  }, [filters, barberId]);

  const fetchReport = async () => {
    if (!barberId) {
      setLoading(false);
      setReport(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await commissionService.getMonthlyReport(
        filters.month,
        filters.year,
        barberId
      );
      setReport(data);
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      let errorMessage = 'Erro ao carregar relatório. Tente novamente.';
      if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNABORTED') {
            errorMessage = 'Conexão interrompida.';
          } else if (err.response?.status === 404) {
            errorMessage = 'Nenhum dado encontrado para este período.';
            setReport(null);
          } else if (err.response?.data?.error) {
             errorMessage = err.response.data.error;
          }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-60 rounded-xl border shadow-lg p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        Carregando relatório...
      </div>
    );
  }

  if (error && !report?.summary) {
    return (
      <div className={`p-4 border rounded-xl shadow-lg text-sm ${isDarkMode ? 'bg-red-900/20 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
        <strong>Erro:</strong> {error}
      </div>
    );
  }

  if (!report?.summary) {
      return (
        <div className={`text-center p-10 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          Nenhum dado encontrado para o período e barbeiro selecionados.
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className={`p-4 sm:p-6 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Filtrar Período</h3>
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          <div className="flex-1">
            <label htmlFor="month" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Mês
            </label>
            <select
              id="month"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className={`block w-full rounded-lg border shadow-sm p-1 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="year" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Ano
            </label>
            <select
              id="year"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className={`block w-full rounded-lg border p-1 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-4 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Serviços</h3>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {report.summary.totalServices}
          </p>
        </div>
        <div className={`p-4 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Valor Total Serviços</h3>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {formatCurrency(report.summary.totalValue)}
          </p>
        </div>
        <div className={`p-4 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Comissão Total</h3>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(report.summary.totalCommission)}
          </p>
        </div>
      </div>

      <div className={`p-4 sm:p-6 rounded-xl border shadow-lg ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Comissão por Serviço</h3>
        <div className="h-72 text-xs" style={{ fontFamily: 'sans-serif' }}>
          <ResponsiveContainer width="100%" height="100%">
             {report.services && report.services.length > 0 ? (
                <BarChart data={report.services} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4B5563' : '#E5E7EB'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} tick={{ fontSize: 10 }} />
                  <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} tickFormatter={(value) => `R$${value}`} tick={{ fontSize: 10 }}/>
                  <Tooltip
                    cursor={{ fill: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)' }}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                      borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                      borderRadius: '0.5rem',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: isDarkMode ? '#D1D5DB' : '#374151', fontSize: '12px' }}
                    labelStyle={{ color: isDarkMode ? '#F9FAFB' : '#111827', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ color: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: '12px' }} />
                  <Bar dataKey="commission" name="Comissão" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                 <div className={`flex items-center justify-center h-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                   Nenhum serviço comissionado neste período.
                 </div>
              )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`rounded-xl border shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold px-4 pt-4 sm:px-6 sm:pt-5 mb-0 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Detalhamento dos Serviços</h3>
         <div className="overflow-x-auto">
           {report.services && report.services.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Data</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Serviço</th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Valor (R$)</th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Taxa (%)</th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Comissão (R$)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {report.services.map((service, index) => (
                    <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(service.date)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{service.name}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatCurrency(service.price)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{service.commissionRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-500">{formatCurrency(service.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
               <div className={`text-center py-10 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                 Nenhum serviço comissionado encontrado para este período.
               </div>
            )}
        </div>
      </div>
    </div>
  );
}; 