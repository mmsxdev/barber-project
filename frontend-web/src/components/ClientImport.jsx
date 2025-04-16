import { useState } from 'react';
import { clientService } from '../services/businessServices';
import { useTheme } from '../contexts/ThemeContext';
import { UploadCloud } from 'lucide-react';

export const ClientImport = ({ onImportComplete }) => {
  const { isDarkMode } = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.type === 'application/vnd.ms-excel' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Selecione um arquivo CSV ou Excel (.csv, .xls, .xlsx).');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um arquivo para importar.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await clientService.import(file);
      setResult(response);
      onImportComplete?.(response);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao importar. Verifique o formato do arquivo.';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className={`p-3 border rounded-lg shadow-sm text-sm ${isDarkMode ? 'bg-red-900/20 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        <div>
          <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Selecione o arquivo
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className={`block w-full text-sm rounded-lg border shadow-sm cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-400 file:bg-gray-600 file:hover:bg-gray-500 file:border-gray-600 file:text-gray-200' : 'border-gray-300 bg-white text-gray-500 placeholder-gray-400 file:bg-gray-100 file:hover:bg-gray-200 file:border-gray-300 file:text-gray-700'} 
                file:mr-4 file:ml-0 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium transition-colors`}
            />
            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full sm:w-auto flex-shrink-0 inline-flex justify-center items-center gap-1.5 px-4 py-2 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 ${isDarkMode ? 'dark:focus:ring-offset-gray-800' : ''} transition-colors`}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
              ) : <UploadCloud size={16}/>}
              {loading ? 'Importando...' : 'Importar'}
            </button>
          </div>
          <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Arquivos CSV, XLS ou XLSX.</p>
        </div>

        {result && (
          <div className={`p-3 border rounded-lg shadow-sm text-sm ${isDarkMode ? 'bg-green-900/20 border-green-700/30 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}`}>
            <h4 className={`font-semibold text-base mb-1 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>Importação Concluída</h4>
            <p className="mt-1">
              <span className="font-medium">Total Registros:</span> {result.total} | 
              <span className="font-medium ml-2">Importados:</span> {result.imported}
              {result.errors?.length > 0 && (
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                  (Erros: {result.errors.length})
                </span>
              )}
            </p>
            {result.errors?.length > 0 && (
              <details className="mt-2 text-xs group">
                  <summary className={`cursor-pointer font-medium ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-700 hover:text-yellow-800'}`}>Ver detalhes dos erros</summary>
                  <ul className="list-disc list-inside mt-1 pl-4 space-y-1 overflow-y-auto max-h-24 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {result.errors.map((error, index) => (
                      <li key={index} className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        <span className="font-semibold">Linha {error.row}:</span> {error.error}
                      </li>
                    ))}
                  </ul>
              </details>
            )}
          </div>
        )}
      </form>

      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700/30 border-gray-600/50' : 'bg-gray-50 border-gray-200/80'}`}>
        <h4 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Instruções</h4>
        <ul className={`text-xs list-disc list-inside space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <li>Colunas: <code className={`text-xs px-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>nome</code> (obrigatório), <code className={`text-xs px-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>telefone</code>, <code className={`text-xs px-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>email</code>, <code className={`text-xs px-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>data_nascimento</code> (DD/MM/AAAA), <code className={`text-xs px-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>observacoes</code></li>
          <li>Telefone deve incluir DDD.</li>
        </ul>
      </div>
    </div>
  );
}; 