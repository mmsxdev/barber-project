import { PrismaClient } from '@prisma/client';
import csv from 'csv-parse';
import { Readable } from 'stream';

const prisma = new PrismaClient();

class ClientService {
  async createClient(data) {
    try {
      const client = await prisma.client.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          notes: data.notes
        }
      });
      return client;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async updateClient(id, data) {
    try {
      const client = await prisma.client.update({
        where: { id },
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          notes: data.notes
        }
      });
      return client;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      await prisma.client.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  async getClient(id) {
    try {
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          schedulings: {
            include: {
              service: true,
              barber: true
            },
            orderBy: {
              dateTime: 'desc'
            }
          }
        }
      });
      return client;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  async listClients(filters = {}) {
    try {
      const clients = await prisma.client.findMany({
        where: {
          name: filters.name ? {
            contains: filters.name,
            mode: 'insensitive'
          } : undefined,
          phone: filters.phone ? {
            contains: filters.phone
          } : undefined
        },
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              schedulings: true
            }
          }
        }
      });
      return clients;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  }

  async importClientsFromCSV(fileBuffer) {
    try {
      const results = {
        total: 0,
        imported: 0,
        errors: []
      };

      const parser = csv.parse({
        columns: true,
        skip_empty_lines: true
      });

      const stream = Readable.from(fileBuffer);
      
      return new Promise((resolve, reject) => {
        stream
          .pipe(parser)
          .on('data', async (row) => {
            results.total++;
            try {
              // Normalizar dados
              const clientData = {
                name: row.name?.trim(),
                phone: row.phone?.trim(),
                email: row.email?.trim(),
                birthDate: row.birthDate ? new Date(row.birthDate) : null,
                notes: row.notes?.trim()
              };

              // Validar dados obrigatórios
              if (!clientData.name) {
                throw new Error('Nome é obrigatório');
              }

              // Criar cliente
              await this.createClient(clientData);
              results.imported++;
            } catch (error) {
              results.errors.push({
                row: results.total,
                error: error.message
              });
            }
          })
          .on('end', () => {
            resolve(results);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error('Erro ao importar clientes:', error);
      throw error;
    }
  }
}

const clientService = new ClientService();
export default clientService; 