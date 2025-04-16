import { PrismaClient } from '@prisma/client';
import whatsappService from './whatsappService.js';
import cron from 'node-cron';

const prisma = new PrismaClient();

class NotificationService {
  constructor() {
    // Verificar notificações pendentes a cada minuto
    cron.schedule('* * * * *', () => this.checkPendingNotifications());
  }

  async createNotification({ userId, message, type = 'SCHEDULING', schedulingId = null }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          type,
          schedulingId,
          status: 'PENDING',
          scheduledFor: new Date()
        }
      });
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  async checkPendingNotifications() {
    try {
      const pendingNotifications = await prisma.notification.findMany({
        where: {
          status: 'PENDING',
          scheduledFor: {
            lte: new Date()
          }
        },
        include: {
          scheduling: true
        }
      });

      for (const notification of pendingNotifications) {
        await this.sendNotification(notification);
      }
    } catch (error) {
      console.error('Erro ao verificar notificações pendentes:', error);
    }
  }

  async sendNotification(notification) {
    try {
      // Se for uma notificação de agendamento, verifica se tem telefone
      if (notification.type === 'SCHEDULING' && notification.scheduling) {
        if (!notification.scheduling.phone) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'FAILED',
              error: 'Telefone não encontrado'
            }
          });
          return;
        }

        // Enviar mensagem via WhatsApp
        // TODO: Implementar envio de mensagem via WhatsApp
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });
      } else if (notification.type === 'COMMISSION_UPDATE') {
        // Para notificações de comissão, apenas marcar como enviada
        // O frontend será responsável por exibir as notificações
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          error: error.message
        }
      });
    }
  }
}

const notificationService = new NotificationService();
export default notificationService; 