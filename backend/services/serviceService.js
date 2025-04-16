import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ServiceService {
  async createService(data) {
    try {
      const service = await prisma.service.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          active: data.active ?? true
        }
      });
      return service;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  }

  async updateService(id, data) {
    try {
      const service = await prisma.service.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          active: data.active
        }
      });
      return service;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
  }

  async deleteService(id) {
    try {
      await prisma.service.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
  }

  async getService(id) {
    try {
      const service = await prisma.service.findUnique({
        where: { id }
      });
      return service;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      throw error;
    }
  }

  async listServices(filters = {}) {
    try {
      const services = await prisma.service.findMany({
        where: {
          active: filters.active,
          name: filters.name ? {
            contains: filters.name,
            mode: 'insensitive'
          } : undefined
        },
        orderBy: {
          name: 'asc'
        }
      });
      return services;
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      throw error;
    }
  }
}

const serviceService = new ServiceService();
export default serviceService; 