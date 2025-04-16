import express from 'express';
import { PrismaClient } from '@prisma/client';
import commissionService from '../services/commissionService.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Obter comissões de um barbeiro
router.get('/barber/:barberId', async (req, res) => {
  try {
    const { barberId } = req.params;
    const commissions = await commissionService.getBarberCommissions(barberId);
    res.json(commissions);
  } catch (error) {
    console.error('Erro ao buscar comissões do barbeiro:', error);
    res.status(500).json({ error: 'Erro ao buscar comissões do barbeiro' });
  }
});

// Definir taxa de comissão
router.post('/', async (req, res) => {
  try {
    const { barberId, serviceId, percentage } = req.body;
    const commission = await commissionService.setCommissionRate(barberId, serviceId, percentage);
    
    // Criar notificação para o barbeiro
    const barber = await prisma.user.findUnique({
      where: { id: barberId }
    });
    
    if (barber) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });
      
      await notificationService.createNotification({
        userId: barberId,
        message: `Sua taxa de comissão para o serviço ${service.name} foi atualizada para ${percentage}%`,
        type: 'COMMISSION_UPDATE'
      });
    }
    
    res.json(commission);
  } catch (error) {
    console.error('Erro ao definir taxa de comissão:', error);
    res.status(500).json({ error: 'Erro ao definir taxa de comissão' });
  }
});

// Obter relatório mensal de comissões
router.get('/report', async (req, res) => {
  try {
    const { month, year, barberId } = req.query;

    // Validar parâmetros
    if (!month || !year || !barberId) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos. É necessário fornecer month, year e barberId' 
      });
    }

    // Validar formato dos números
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return res.status(400).json({ 
        error: 'Parâmetros month e year devem ser números válidos' 
      });
    }

    // Validar intervalo do mês
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ 
        error: 'O mês deve estar entre 1 e 12' 
      });
    }

    // Validar ano
    if (yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ 
        error: 'Ano inválido' 
      });
    }

    const report = await commissionService.calculateMonthlyCommission(
      barberId,
      monthNum,
      yearNum
    );
    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório de comissões:', error);
    
    // Verificar tipo de erro
    if (error.message === 'Barbeiro não encontrado') {
      return res.status(404).json({ error: 'Barbeiro não encontrado' });
    }
    
    res.status(500).json({ 
      error: 'Erro ao gerar relatório de comissões',
      details: error.message 
    });
  }
});

// Atualizar taxa de comissão
router.put('/:barberId/:serviceId', async (req, res) => {
  try {
    const { barberId, serviceId } = req.params;
    const { percentage } = req.body;
    const commission = await commissionService.updateCommissionRate(barberId, serviceId, percentage);
    
    // Criar notificação para o barbeiro
    const barber = await prisma.user.findUnique({
      where: { id: barberId }
    });
    
    if (barber) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });
      
      await notificationService.createNotification({
        userId: barberId,
        message: `Sua taxa de comissão para o serviço ${service.name} foi atualizada para ${percentage}%`,
        type: 'COMMISSION_UPDATE'
      });
    }
    
    res.json(commission);
  } catch (error) {
    console.error('Erro ao atualizar taxa de comissão:', error);
    res.status(500).json({ error: 'Erro ao atualizar taxa de comissão' });
  }
});

// Deletar taxa de comissão
router.delete('/:barberId/:serviceId', async (req, res) => {
  try {
    const { barberId, serviceId } = req.params;
    await commissionService.deleteCommissionRate(barberId, serviceId);
    res.json({ message: 'Taxa de comissão deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar taxa de comissão:', error);
    res.status(500).json({ error: 'Erro ao deletar taxa de comissão' });
  }
});

export default router; 