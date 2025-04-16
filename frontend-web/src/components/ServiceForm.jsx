import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CheckSquare } from 'lucide-react';

export const ServiceForm = ({ service, onSubmit, onCancel }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price !== null ? String(service.price) : '',
        duration: service.duration !== null ? String(service.duration) : '',
        active: service.active !== undefined ? service.active : true,
      });
    } else {
      setFormData({ name: '', description: '', price: '', duration: '', active: true });
    }
    setErrors({});
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório.';

    const priceNum = parseFloat(formData.price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Preço inválido (deve ser > 0).';
    }

    const durationNum = parseInt(formData.duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      newErrors.duration = 'Duração inválida (deve ser > 0).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price.replace(',', '.')),
        duration: parseInt(formData.duration),
      };
      onSubmit(dataToSubmit);
    }
  };

  const inputBaseClass = `block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors`;
  const inputNormalClass = `${inputBaseClass} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`;
  const inputErrorClass = `${inputBaseClass} border-red-500 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 text-red-400 placeholder-gray-500' : 'bg-white text-red-600 placeholder-red-300'}`;
  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>Nome do Serviço</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? inputErrorClass : inputNormalClass}
          placeholder="Ex: Corte Masculino"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Descrição (Opcional)</label>
        <textarea
          name="description"
          id="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className={inputNormalClass}
          placeholder="Detalhes adicionais sobre o serviço"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className={labelClass}>Preço (R$)</label>
          <input
            type="text"
            name="price"
            id="price"
            inputMode="decimal"
            value={formData.price}
            onChange={handleChange}
            className={errors.price ? inputErrorClass : inputNormalClass}
            placeholder="Ex: 50,00"
          />
          {errors.price && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="duration" className={labelClass}>Duração (minutos)</label>
          <input
            type="number"
            name="duration"
            id="duration"
            inputMode="numeric"
            value={formData.duration}
            onChange={handleChange}
            className={errors.duration ? inputErrorClass : inputNormalClass}
            placeholder="Ex: 45"
          />
          {errors.duration && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.duration}</p>}
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={formData.active}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:checked:bg-blue-600 dark:checked:border-blue-600"
        />
        <label htmlFor="active" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Serviço Ativo</label>
      </div>

      <hr className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
        >
          <CheckSquare size={16} className="-ml-0.5" />
          Salvar Serviço
        </button>
      </div>
    </form>
  );
}; 