import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CommissionService {
  async setCommissionRate(barberId, serviceId, percentage) {
    try {
      const commission = await prisma.commission.upsert({
        where: {
          barberId_serviceId: {
            barberId: barberId,
            serviceId: serviceId
          }
        },
        update: {
          percentage
        },
        create: {
          barberId,
          serviceId,
          percentage
        }
      });
      return commission;
    } catch (error) {
      console.error('Erro detalhado ao definir taxa de comissão:', error);
      throw new Error('Falha ao definir a taxa de comissão.');
    }
  }

  async getCommissionRate(barberId, serviceId) {
    try {
      const commission = await prisma.commission.findUnique({
        where: {
          barberId_serviceId: {
            barberId,
            serviceId
          }
        }
      });
      return commission?.percentage ?? 0;
    } catch (error) {
      console.error('Erro ao buscar taxa de comissão:', error);
      throw error;
    }
  }

  async calculateMonthlyCommission(barberId, month, year) {
    try {
      // Validar parâmetros
      if (!barberId || !month || !year) {
        throw new Error('Parâmetros inválidos');
      }

      // Buscar o barbeiro
      const barber = await prisma.user.findUnique({
        where: { id: barberId },
        select: { name: true }
      });

      if (!barber) {
        throw new Error('Barbeiro não encontrado');
      }

      // Definir período do relatório
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Buscar agendamentos do período
      const schedulings = await prisma.scheduling.findMany({
        where: {
          barberId,
          dateTime: {
            gte: startDate,
            lte: endDate
          },
          status: 'CONFIRMED'
        },
        include: {
          service: true,
          barber: {
            include: {
              commissions: true // Incluir comissões do barbeiro
            }
          }
        }
      });

      // Calcular comissões
      const services = schedulings.map(scheduling => {
        // Encontrar a taxa de comissão específica para este serviço e barbeiro
        const commissionRule = scheduling.barber.commissions.find(
          rule => rule.serviceId === scheduling.serviceId
        );
        
        // Usar a taxa específica ou um padrão (ex: 0% se não definida)
        const commissionRate = commissionRule ? commissionRule.percentage : 0;
        const commissionValue = scheduling.service.price * (commissionRate / 100);

        return {
          id: scheduling.service.id,
          name: scheduling.service.name,
          price: scheduling.service.price,
          commission: commissionValue,
          commissionRate: commissionRate, // Adicionar a taxa usada
          date: scheduling.dateTime
        };
      });

      // Calcular totais
      const totalServices = services.length;
      const totalValue = services.reduce((acc, service) => acc + service.price, 0);
      const totalCommission = services.reduce((acc, service) => acc + service.commission, 0);

      return {
        barber: {
          id: barberId,
          name: barber.name
        },
        period: {
          month,
          year
        },
        summary: {
          totalServices,
          totalValue,
          totalCommission
        },
        services
      };
    } catch (error) {
      console.error('Erro ao calcular comissão mensal:', error);
      throw error;
    }
  }

  async getBarberCommissions(barberId) {
    try {
      const commissions = await prisma.commission.findMany({
        where: {
          barberId
        },
        include: {
          service: true
        }
      });
      return commissions;
    } catch (error) {
      console.error('Erro ao buscar comissões do barbeiro:', error);
      throw error;
    }
  }

  async updateCommissionRate(barberId, serviceId, percentage) {
    try {
      const commission = await prisma.commission.update({
        where: {
          barberId_serviceId: {
            barberId,
            serviceId
          }
        },
        data: {
          percentage
        }
      });
      return commission;
    } catch (error) {
      console.error('Erro ao atualizar taxa de comissão:', error);
      throw error;
    }
  }

  async deleteCommissionRate(barberId, serviceId) {
    try {
      await prisma.commission.delete({
        where: {
          barberId_serviceId: {
            barberId,
            serviceId
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao deletar taxa de comissão:', error);
      throw error;
    }
  }
}

const commissionService = new CommissionService();
export default commissionService; 