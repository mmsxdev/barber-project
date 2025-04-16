import express from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../Middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos os clientes
router.get('/', auth, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(clients);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Obter um cliente específico
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: 'Erro ao obter cliente' });
  }
});

// Criar um novo cliente
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, email, notes, birthDate } = req.body;

    const client = await prisma.client.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || '',
        birthDate: birthDate ? new Date(birthDate) : null,
        updatedAt: new Date()
      }
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar um cliente
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, email, notes, birthDate } = req.body;

    const client = await prisma.client.update({
      where: {
        id: req.params.id
      },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || '',
        birthDate: birthDate ? new Date(birthDate) : null,
        updatedAt: new Date()
      }
    });

    res.json(client);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Excluir um cliente
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.client.delete({
      where: {
        id: req.params.id
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

export default router; 