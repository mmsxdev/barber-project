import { useState, useEffect } from 'react';
import { clientService } from '../services/businessServices';
import { useTheme } from '../contexts/ThemeContext';

export const ClientForm = ({ client, onSubmit, onCancel }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        phone: client.phone ? formatPhone(client.phone) : '',
        email: client.email || '',
        birthDate: client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : '',
        notes: client.notes || ''
      });
    } else {
      setFormData({ name: '', phone: '', email: '', birthDate: '', notes: '' });
    }
  }, [client]);

  const formatPhone = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 3) return `(${phoneNumber}`;
    if (phoneNumberLength < 8) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    if (phoneNumberLength < 11) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 3)} ${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, '')
      };
      await onSubmit(dataToSend);
    } catch (err) {
      setError('Erro ao salvar cliente.');
      console.error(err);
    }
  };

  const inputClasses = `block w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`;
  const labelClasses = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className={`p-3 border rounded-lg shadow-sm text-sm ${isDarkMode ? 'bg-red-900/20 border-red-700/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClasses}>
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClasses}>
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          className={inputClasses}
          placeholder="(00) 90000-0000"
          maxLength="16"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClasses}
          placeholder="cliente@email.com"
        />
      </div>

      <div>
        <label htmlFor="birthDate" className={labelClasses}>
          Data de Nascimento
        </label>
        <input
          type="date"
          id="birthDate"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          className={`${inputClasses} ${isDarkMode ? 'dark:[color-scheme:dark]' : ''}`}
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClasses}>
          Observações
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className={inputClasses}
          placeholder="Preferências, alergias, etc."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 text-sm font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 hover:bg-gray-500 focus:ring-offset-gray-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white'} transition-colors`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`px-4 py-2 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'dark:focus:ring-offset-gray-800' : ''} transition-colors`}
        >
          {client ? 'Salvar Alterações' : 'Criar Cliente'}
        </button>
      </div>
    </form>
  );
}; 