import { PrismaClient } from "@prisma/client";
import whatsappService from "./whatsappService.js";

const prisma = new PrismaClient();

class SchedulingService {
  async createScheduling(data) {
    try {
      // Criar o agendamento com status PENDING
      const scheduling = await prisma.scheduling.create({
        data: {
          clientName: data.clientName,
          dateTime: new Date(data.dateTime),
          service: data.service,
          status: "PENDING", // Agora sempre começa como pendente
          barberId: data.barberId,
          userId: data.barberId, // Usa o barbeiro como criador
          phone: data.phone, // Armazena o telefone
        },
        include: {
          barber: { select: { name: true } },
        },
      });

      // Enviar mensagem WhatsApp para o cliente
      if (scheduling && scheduling.phone) {
        // Telefone da barbearia como número fixo
        const shopPhone = "62996535236";

        // Obter nome do barbeiro
        const barberName = scheduling.barber?.name || "profissional";

        // Formatar data para exibição
        const date = new Date(scheduling.dateTime);
        const formattedDate = date.toLocaleDateString("pt-BR");
        const formattedTime = date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Criar mensagem
        const message =
          `*Olá ${scheduling.clientName}!*\n\n` +
          `Recebemos seu agendamento na Barbearia Style para ${scheduling.service} com ${barberName} no dia ${formattedDate} às ${formattedTime}.\n\n` +
          `Por favor, responda com *CONFIRMAR* para confirmar seu agendamento ou *CANCELAR* caso precise remarcar.\n\n` +
          `Agradecemos a preferência!\n` +
          `*Barbearia Style*`;

        // Enviar mensagem via WhatsApp
        whatsappService.sendMessage(scheduling.phone, message);
      }

      return scheduling;
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      throw error;
    }
  }

  async confirmScheduling(schedulingId) {
    try {
      const updatedScheduling = await prisma.scheduling.update({
        where: { id: schedulingId },
        data: { status: "CONFIRMED" },
      });
      return updatedScheduling;
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      throw error;
    }
  }

  async cancelScheduling(schedulingId) {
    try {
      const updatedScheduling = await prisma.scheduling.update({
        where: { id: schedulingId },
        data: { status: "CANCELED" },
      });
      return updatedScheduling;
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      throw error;
    }
  }

  async getSchedulingByPhone(phone) {
    // Remover formatação do telefone para comparação
    const cleanPhone = phone.replace(/\D/g, "");

    // Verificar se o número já contém o prefixo do Brasil
    let searchPhone = cleanPhone;

    // Se o número começar com 55 (código do Brasil), remove para comparação
    if (cleanPhone.startsWith("55") && cleanPhone.length >= 12) {
      // Remove o prefixo 55 para buscar números sem código do país
      searchPhone = cleanPhone.substring(2);
      console.log(`Removendo prefixo do Brasil para busca: ${searchPhone}`);
    }

    try {
      // Buscar agendamentos pendentes deste telefone, ordenados por data
      const schedulings = await prisma.scheduling.findMany({
        where: {
          OR: [
            { phone: { contains: cleanPhone } }, // Busca pelo número completo (com ou sem +55)
            { phone: { contains: searchPhone } }, // Busca pelo número sem o +55
          ],
          status: "PENDING",
        },
        orderBy: { dateTime: "asc" },
      });

      console.log(
        `Agendamentos encontrados para ${phone}: ${schedulings.length}`
      );
      return schedulings;
    } catch (error) {
      console.error("Erro ao buscar agendamento pelo telefone:", error);
      throw error;
    }
  }
}

export default new SchedulingService();
