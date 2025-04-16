import { useState, useEffect } from 'react';
import { serviceService } from '../services/businessServices';
import { ServiceForm } from './ServiceForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ServiceList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await serviceService.list();
      setServices(data);
    } catch (err) {
      setError('Erro ao carregar serviços. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    try {
      await serviceService.delete(serviceId);
      await fetchServices();
    } catch (err) {
      setError('Erro ao excluir serviço.');
      console.error(err);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedService) {
        await serviceService.update(selectedService.id, formData);
      } else {
        await serviceService.create(formData);
      }
      setShowForm(false);
      setSelectedService(null);
      await fetchServices();
    } catch (err) {
      setError('Erro ao salvar serviço.');
      console.error(err);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '-';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let durationString = '';
    if (hours > 0) durationString += `${hours}h`;
    if (remainingMinutes > 0) durationString += `${hours > 0 ? ' ' : ''}${remainingMinutes}min`;
    return durationString || '-';
  };

  if (loading) {
    return (
      <div className={`p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`flex flex-col items-center justify-center h-60 w-full max-w-md rounded-xl border shadow-lg p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          Carregando serviços...
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 min-h-screen space-y-6 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            title="Voltar ao Dashboard"
            className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Serviços
          </h1>
        </div>
        <button
          onClick={() => {
            setSelectedService(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-transparent rounded-lg shadow-md text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
        >
          <Plus size={16} /> Novo Serviço
        </button>
      </div>

      {error && (
        <div className={`p-4 border rounded-xl shadow-sm text-sm mb-6 ${isDarkMode ? 'bg-red-900/20 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className={`rounded-xl border shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800/80 border-gray-700 divide-gray-700' : 'bg-white border-gray-200 divide-gray-200'}`}>
        <div className={`px-4 py-4 sm:px-6 border-b border-inherit ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Lista de Serviços</h3>
        </div>
        {services.length > 0 ? (
          <ul className={`divide-y divide-inherit`}>
            {services.map((service) => (
              <li key={service.id} className={`px-4 py-4 sm:px-6 ${isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50/50'} transition-colors`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          service.active
                            ? isDarkMode ? 'bg-green-900/50 text-green-300 border-green-700/50' : 'bg-green-100 text-green-800 border-green-200'
                            : isDarkMode ? 'bg-red-900/50 text-red-300 border-red-700/50' : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <h3 className={`text-base sm:text-lg font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {service.name}
                      </h3>
                    </div>
                    {service.description && (
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="flex-1 sm:flex-none text-right sm:text-left">
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {formatCurrency(service.price)}
                      </p>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDuration(service.duration)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <button
                        onClick={() => handleEdit(service)}
                        title="Editar"
                        className={`p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'dark:text-blue-400 dark:focus:ring-offset-gray-800' : 'focus:ring-offset-white'} transition-colors`}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        title="Excluir"
                        className={`p-1.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isDarkMode ? 'dark:text-red-400 dark:focus:ring-offset-gray-800' : 'focus:ring-offset-white'} transition-colors`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={`text-center py-12 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Tag size={48} className="mx-auto opacity-50 mb-3" />
            Nenhum serviço cadastrado.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-out">
          <div className={`rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 ease-out border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedService(null);
                }}
                className={`p-1 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <ServiceForm
                service={selectedService}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedService(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 