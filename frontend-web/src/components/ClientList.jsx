import { useState, useEffect } from 'react';
import { clientService } from '../services/businessServices';
import { ClientImport } from './ClientImport';
import { ClientForm } from './ClientForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Upload, Search, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ClientList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await clientService.list();
      setClients(data);
    } catch (err) {
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await clientService.delete(clientId);
      await fetchClients();
    } catch (err) {
      setError('Erro ao excluir cliente. Por favor, tente novamente.');
      console.error(err);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedClient) {
        await clientService.update(selectedClient.id, formData);
      } else {
        await clientService.create(formData);
      }
      setShowForm(false);
      setSelectedClient(null);
      await fetchClients();
    } catch (err) {
      setError('Erro ao salvar cliente. Por favor, tente novamente.');
      console.error(err);
    }
  };

  const handleImportComplete = () => {
    setShowImport(false);
    fetchClients();
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`flex flex-col items-center justify-center h-60 w-full max-w-md rounded-xl border shadow-lg p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          Carregando clientes...
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
            Clientes
          </h1>
        </div>
        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={() => {
              setSelectedClient(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-transparent rounded-lg shadow-md text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <UserPlus size={16} /> Novo
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-transparent rounded-lg shadow-md text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <Upload size={16} /> Importar
          </button>
        </div>
      </div>

      {error && (
        <div className={`p-4 border rounded-xl shadow-sm text-sm mb-6 ${isDarkMode ? 'bg-red-900/20 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className={`rounded-xl border shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800/80 border-gray-700 divide-gray-700' : 'bg-white border-gray-200 divide-gray-200'}`}>
        <div className={`px-4 py-4 sm:px-6 border-b border-inherit ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
          <div className="max-w-sm w-full">
            <label htmlFor="search-clients" className="sr-only">Buscar clientes</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                id="search-clients"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-500 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`}
                placeholder="Buscar cliente..."
              />
            </div>
          </div>
        </div>

        <div>
          {filteredClients.length > 0 ? (
            <ul className={`divide-y divide-inherit`}>
              {filteredClients.map((client) => (
                <li key={client.id} className={`px-4 py-4 sm:px-6 ${isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50/50'} transition-colors`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {client.name}
                      </h3>
                      <div className={`mt-1 text-xs sm:text-sm space-y-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {client.phone && <p><span className="font-medium">Tel:</span> {client.phone}</p>}
                        {client.email && <p><span className="font-medium">Email:</span> {client.email}</p>}
                        {client.birthDate && <p><span className="font-medium">Nasc:</span> {new Date(client.birthDate).toLocaleDateString('pt-BR')}</p>}
                        {client.notes && <p className="mt-1 text-xs italic"><span className="font-medium">Obs:</span> {client.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleEdit(client)}
                        title="Editar"
                        className={`p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'dark:text-blue-400 dark:focus:ring-offset-gray-800' : 'focus:ring-offset-white'} transition-colors`}
                      >
                        <Edit size={18}/>
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        title="Excluir"
                        className={`p-1.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isDarkMode ? 'dark:text-red-400 dark:focus:ring-offset-gray-800' : 'focus:ring-offset-white'} transition-colors`}
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`text-center py-12 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 opacity-50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-out">
          <div className={`rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 ease-out border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button 
                onClick={() => { setShowForm(false); setSelectedClient(null); }}
                className={`p-1 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <ClientForm
                client={selectedClient}
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowForm(false); setSelectedClient(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-out">
          <div className={`rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 ease-out border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Importar Clientes
              </h3>
              <button 
                onClick={() => setShowImport(false)}
                className={`p-1 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <ClientImport onImportComplete={handleImportComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 