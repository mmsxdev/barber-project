import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import axios from "axios";

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.currentQRCode = null;
    this.qrRetries = 0;
    this.maxQrRetries = 5;
    this.initialize();
  }

  initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: "./wwebjs_auth", // Explicitamente definir o caminho para os dados de autenticação
      }),
      puppeteer: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
        headless: true,
        timeout: 60000, // Aumentar timeout para 60 segundos
      },
      qrMaxRetries: 5, // Número máximo de tentativas de QR code antes de dar erro
      restartOnAuthFail: true, // Tenta reiniciar em caso de falha na autenticação
    });

    this.client.on("qr", (qr) => {
      // Armazenar o QR code para disponibilizá-lo via API
      this.currentQRCode = qr;
      this.qrRetries++;

      console.log(
        `QR CODE PARA AUTENTICAÇÃO DO WHATSAPP (tentativa ${this.qrRetries}/${this.maxQrRetries}):`
      );
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.currentQRCode = null; // Limpar QR code quando autenticado
      this.qrRetries = 0; // Reiniciar contador de tentativas
      console.log("Cliente WhatsApp está pronto!");
    });

    this.client.on("authenticated", () => {
      console.log("Autenticado com sucesso!");
      this.qrRetries = 0; // Reiniciar contador de tentativas
    });

    this.client.on("auth_failure", (msg) => {
      console.error("Falha na autenticação:", msg);
      // Não reiniciar imediatamente para evitar loop de tentativas
      setTimeout(() => {
        if (this.qrRetries < this.maxQrRetries) {
          console.log("Tentando reconectar após falha na autenticação...");
          this.client.initialize().catch((err) => {
            console.error("Erro ao reinicializar cliente WhatsApp:", err);
          });
        } else {
          console.error(
            "Número máximo de tentativas excedido. Reinicie o servidor."
          );
        }
      }, 5000);
    });

    this.client.on("disconnected", (reason) => {
      console.log("Cliente WhatsApp desconectado:", reason);
      this.isReady = false;

      // Tentar reconectar após 5 segundos
      setTimeout(() => {
        console.log("Tentando reconectar...");
        this.client.initialize().catch((err) => {
          console.error("Erro ao reinicializar cliente WhatsApp:", err);
        });
      }, 5000);
    });

    // Processar mensagens recebidas
    this.client.on("message", async (message) => {
      try {
        console.log(`Mensagem recebida de ${message.from}: ${message.body}`);

        // Processar apenas mensagens de chat (não de grupo)
        if (message.from.endsWith("@c.us")) {
          // Processar mensagem através da rota
          await this.processMessage(message.from, message.body);
        }
      } catch (error) {
        console.error("Erro ao processar mensagem recebida:", error);
      }
    });

    this.client.initialize().catch((err) => {
      console.error("Erro ao inicializar cliente WhatsApp:", err);
    });
  }

  // Método para obter o QR code atual
  getQRCode() {
    return this.currentQRCode;
  }

  // Verificar se o cliente está autenticado
  isAuthenticated() {
    return this.isReady;
  }

  async processMessage(from, message) {
    try {
      // Remover o sufixo @c.us do número
      const phoneNumber = from.replace("@c.us", "");

      // Enviar para a rota de processamento
      await axios.post("http://localhost:3000/webhook/process-message", {
        from: phoneNumber,
        message: message,
      });

      return true;
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      return false;
    }
  }

  async sendMessage(to, message) {
    if (!this.isReady) {
      console.log("Cliente WhatsApp não está pronto. Aguardando...");
      return false;
    }

    try {
      // Remover todos os caracteres não numéricos
      const cleanNumber = to.replace(/\D/g, "");

      // Verificar se é um número brasileiro sem o código do país
      // (começa com DDD, que normalmente tem 2 dígitos, seguido do número com 8 ou 9 dígitos)
      let formattedNumber = cleanNumber;

      // Se o número tem comprimento entre 10 e 11 dígitos (DDD + número), consideramos brasileiro
      // e adicionamos o código do país +55
      if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
        formattedNumber = `55${cleanNumber}`;
        console.log(
          `Formato brasileiro detectado, adicionando prefixo +55: ${formattedNumber}`
        );
      }

      // Adiciona @c.us ao final do número (formato usado pelo WhatsApp)
      const chatId = `${formattedNumber}@c.us`;

      await this.client.sendMessage(chatId, message);
      console.log(
        `Mensagem enviada para ${to} (formatado como ${formattedNumber})`
      );
      return true;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      return false;
    }
  }

  async confirmScheduling(phoneNumber, schedulingId) {
    try {
      // Atualizar o status do agendamento para CONFIRMED
      // Este método será chamado quando o cliente confirmar pelo WhatsApp
      console.log(`Agendamento ${schedulingId} confirmado`);
      return true;
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      return false;
    }
  }
}

// Cria uma instância única do serviço
const whatsappService = new WhatsAppService();

export default whatsappService;
