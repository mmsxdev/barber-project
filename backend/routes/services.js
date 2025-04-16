import express from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../Middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos os serviços
router.get('/', auth, async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(services);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro ao listar serviços' });
  }
});

// Obter um serviço específico
router.get('/:id', auth, async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (error) {
    console.error('Erro ao obter serviço:', error);
    res.status(500).json({ error: 'Erro ao obter serviço' });
  }
});

// Criar um novo serviço
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, duration, active } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        duration: parseInt(duration),
        active: active ?? true,
        updatedAt: new Date() // Definindo explicitamente updatedAt
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// Atualizar um serviço
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, price, duration, active } = req.body;

    const service = await prisma.service.update({
      where: {
        id: req.params.id
      },
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        duration: parseInt(duration),
        active,
        updatedAt: new Date() // Definindo explicitamente updatedAt
      }
    });

    res.json(service);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// Excluir um serviço
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.service.delete({
      where: {
        id: req.params.id
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

export default router; 