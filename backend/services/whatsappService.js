// backend/services/whatsappService.js
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";

// Garantir que o diretório de autenticação exista
const AUTH_FOLDER = "./auth_baileys_sessions";
if (!fs.existsSync(AUTH_FOLDER)) {
  fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

class WhatsAppService {
  constructor() {
    this.socket = null;
    this.qr = null;
    this.isReady = false;
    this.initialize();
  }

  async initialize() {
    // Estado de autenticação - armazena sessão em arquivos
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    // Criar socket do WhatsApp
    this.socket = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    // Processar eventos
    this.socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Armazenar QR code para a interface web
      if (qr) {
        this.qr = qr;
        console.log("QR Code disponível para leitura");
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error instanceof Boom
            ? lastDisconnect.error.output.statusCode !==
              DisconnectReason.loggedOut
            : true;

        console.log(
          "Conexão WhatsApp fechada: ",
          lastDisconnect?.error?.message
        );

        if (shouldReconnect) {
          console.log("Reconectando WhatsApp...");
          this.initialize();
        }
      } else if (connection === "open") {
        this.isReady = true;
        this.qr = null;
        console.log("WhatsApp conectado!");
      }
    });

    // Salvar credenciais quando atualizadas
    this.socket.ev.on("creds.update", saveCreds);

    // Processar mensagens recebidas
    this.socket.ev.on("messages.upsert", async (m) => {
      if (m.type === "notify") {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            const textMessage =
              msg.message.conversation ||
              msg.message.extendedTextMessage?.text ||
              "";

            const sender = msg.key.remoteJid;

            console.log(`Nova mensagem de ${sender}: ${textMessage}`);
            try {
              // Processar a mensagem - modifique para usar sua lógica
              await this.processIncomingMessage(sender, textMessage);
            } catch (error) {
              console.error("Erro ao processar mensagem:", error);
            }
          }
        }
      }
    });
  }

  // Obter o QR Code atual
  getQRCode() {
    return this.qr;
  }

  // Verificar se está conectado
  isConnected() {
    return this.isReady;
  }

  async processIncomingMessage(from, message) {
    // Remover o sufixo @s.whatsapp.net se existir
    const phoneNumber = from.split("@")[0];

    // Se a mensagem for "CONFIRMAR" ou "CANCELAR", processar
    const messageUpper = message.trim().toUpperCase();

    if (messageUpper === "CONFIRMAR" || messageUpper === "CANCELAR") {
      try {
        // Use a mesma estrutura que você já tem
        await this.processConfirmationOrCancellation(phoneNumber, messageUpper);
      } catch (error) {
        console.error("Erro ao processar confirmação/cancelamento:", error);
      }
    }
  }

  async processConfirmationOrCancellation(phone, messageText) {
    try {
      // Enviar requisição para API que processa isso
      // Aqui você pode adaptar para chamar diretamente o serviço em vez de usar axios
      const isConfirmation = messageText === "CONFIRMAR";
      const isCancellation = messageText === "CANCELAR";

      const schedulingService = (
        await import("../services/schedulingService.js")
      ).default;

      // Buscar agendamentos pelo telefone
      const schedulings = await schedulingService.getSchedulingByPhone(phone);

      if (!schedulings || schedulings.length === 0) {
        return await this.sendMessage(
          phone,
          "Não encontramos nenhum agendamento pendente para este número."
        );
      }

      // Pegar o agendamento mais recente
      const scheduling = schedulings[0];

      if (isConfirmation) {
        // Confirmar agendamento
        await schedulingService.confirmScheduling(scheduling.id);

        // Enviar mensagem de confirmação
        const confirmMessage =
          `*Agendamento Confirmado!*\n\n` +
          `Obrigado por confirmar seu agendamento.\n` +
          `Esperamos você no dia ${new Date(
            scheduling.dateTime
          ).toLocaleDateString("pt-BR")} ` +
          `às ${new Date(scheduling.dateTime).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}.\n\n` +
          `*Barbearia Style*`;

        await this.sendMessage(phone, confirmMessage);
      } else if (isCancellation) {
        // Cancelar agendamento
        await schedulingService.cancelScheduling(scheduling.id);

        // Enviar mensagem de cancelamento
        const cancelMessage =
          `*Agendamento Cancelado*\n\n` +
          `Seu agendamento foi cancelado conforme solicitado.\n` +
          `Para reagendar, visite nosso site ou entre em contato conosco.\n\n` +
          `*Barbearia Style*`;

        await this.sendMessage(phone, cancelMessage);
      }

      return true;
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      return false;
    }
  }

  async sendMessage(to, message) {
    if (!this.isReady) {
      console.log("WhatsApp não está conectado. Aguardando...");
      return false;
    }

    try {
      // Remover todos os caracteres não numéricos
      const cleanNumber = to.replace(/\D/g, "");

      // Verificar se é um número brasileiro sem o código do país
      let formattedNumber = cleanNumber;

      // Se o número tem comprimento entre 10 e 11 dígitos, adicionamos o prefixo 55
      if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
        formattedNumber = `55${cleanNumber}`;
        console.log(
          `Formato brasileiro detectado, adicionando prefixo +55: ${formattedNumber}`
        );
      }

      // Adiciona @s.whatsapp.net (formato usado pelo Baileys)
      const jid = `${formattedNumber}@s.whatsapp.net`;

      // Enviar a mensagem
      await this.socket.sendMessage(jid, { text: message });

      console.log(
        `Mensagem enviada para ${to} (formatado como ${formattedNumber})`
      );
      return true;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      return false;
    }
  }
}

// Cria uma instância única do serviço
const whatsappService = new WhatsAppService();

export default whatsappService;
