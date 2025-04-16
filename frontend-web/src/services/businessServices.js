import api from './api';

// Serviços
export const serviceService = {
  list: async (filters = {}) => {
    const response = await api.get('/services', { params: filters });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/services', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  }
};

// Clientes
export const clientService = {
  list: async (filters = {}) => {
    const response = await api.get('/clients', { params: filters });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  import: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/clients/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Usuários
export const userService = {
  list: async (filters = {}) => {
    const response = await api.get('/listar-usuarios', { params: filters });
    return response.data.users;
  },
  
  getByRole: async (role) => {
    const response = await api.get('/listar-usuarios');
    return response.data.users.filter(user => user.role === role);
  }
};

// Comissões
export const commissionService = {
  getBarberCommissions: async (barberId) => {
    const response = await api.get(`/commissions/barber/${barberId}`);
    return response.data;
  },

  setCommissionRate: async (barberId, serviceId, percentage) => {
    const response = await api.post('/commissions', {
      barberId,
      serviceId,
      percentage
    });
    return response.data;
  },

  getMonthlyReport: async (month, year, barberId) => {
    const response = await api.get('/commissions/report', {
      params: { month, year, barberId }
    });
    return response.data;
  }
};

// Notificações
export const notificationService = {
  getSchedulingNotifications: async (schedulingId) => {
    const response = await api.get(`/notifications/scheduling/${schedulingId}`);
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },

  getNotificationSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  }
}; 