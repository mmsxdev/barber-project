import pkg from "whatsapp-web.js";
const { Client, LocalAuth, RemoteAuth } = pkg;
import qrcode from "qrcode-terminal";
import axios from "axios";
import fs from "fs";
import path from "path";

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.currentQRCode = null;
    this.qrRetries = 0;
    this.maxQrRetries = 10; // Aumentado o número de tentativas
    this.connectionStatus = "disconnected"; // novo status para acompanhar o estado da conexão
    this.lastQrTimestamp = null;
    this.initialize();
  }

  initialize() {
    // Criar diretório para os dados se não existir
    const authDir = path.resolve("./wwebjs_auth");
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: "./wwebjs_auth",
        clientId: "barbearia-session", // ID fixo para manter a sessão
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
          "--disable-extensions",
          "--disable-component-extensions-with-background-pages",
          "--disable-default-apps",
          "--mute-audio",
          "--hide-scrollbars",
        ],
        headless: true,
        timeout: 90000, // Aumentado para 90 segundos
      },
      qrMaxRetries: 10,
      restartOnAuthFail: true,
      qrTimeoutMs: 120000, // 2 minutos para cada QR code
    });

    this.client.on("qr", (qr) => {
      this.connectionStatus = "qr_received";

      // Só atualiza o QR se for o primeiro ou se já passou pelo menos 1 minuto
      const now = Date.now();
      if (!this.lastQrTimestamp || now - this.lastQrTimestamp > 60000) {
        this.currentQRCode = qr;
        this.lastQrTimestamp = now;
        this.qrRetries++;

        console.log(
          `QR CODE PARA AUTENTICAÇÃO DO WHATSAPP (tentativa ${this.qrRetries}/${this.maxQrRetries}):`
        );
        qrcode.generate(qr, { small: true });

        // Salvar o QR code em um arquivo para facilitar o acesso
        try {
          fs.writeFileSync("./wwebjs_auth/current_qr.txt", qr);
        } catch (err) {
          console.error("Erro ao salvar QR code:", err);
        }
      } else {
        console.log(
          "Mantendo QR code atual para permitir tempo suficiente para escaneamento"
        );
      }
    });

    this.client.on("loading_screen", (percent, message) => {
      this.connectionStatus = "loading";
      console.log(`WhatsApp carregando: ${percent}% - ${message}`);
    });

    this.client.on("authenticated", () => {
      this.connectionStatus = "authenticated";
      console.log("Autenticado com sucesso!");
      this.qrRetries = 0;

      // Limpar o arquivo de QR quando autenticado
      try {
        if (fs.existsSync("./wwebjs_auth/current_qr.txt")) {
          fs.unlinkSync("./wwebjs_auth/current_qr.txt");
        }
      } catch (err) {
        console.error("Erro ao remover arquivo de QR:", err);
      }
    });

    this.client.on("auth_failure", (msg) => {
      this.connectionStatus = "auth_failure";
      console.error("Falha na autenticação:", msg);

      // Limpar dados de autenticação para forçar nova sessão
      try {
        const authPath = path.join("./wwebjs_auth", "barbearia-session");
        if (fs.existsSync(authPath)) {
          fs.rmSync(authPath, { recursive: true, force: true });
          console.log("Limpeza dos dados de autenticação realizada");
        }
      } catch (err) {
        console.error("Erro ao limpar dados de autenticação:", err);
      }

      // Reiniciar após 10 segundos
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
      }, 10000);
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.connectionStatus = "ready";
      this.currentQRCode = null;
      this.qrRetries = 0;
      console.log("Cliente WhatsApp está pronto!");
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this.connectionStatus = "disconnected";
      console.log("Cliente WhatsApp desconectado:", reason);

      // Tentar reconectar após 10 segundos
      setTimeout(() => {
        console.log("Tentando reconectar...");
        this.client.initialize().catch((err) => {
          console.error("Erro ao reinicializar cliente WhatsApp:", err);
        });
      }, 10000);
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

    console.log("Inicializando cliente WhatsApp...");
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

  // Retorna o status atual da conexão
  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      isReady: this.isReady,
      qrRetries: this.qrRetries,
      lastQrTimestamp: this.lastQrTimestamp,
    };
  }

  // Método para forçar nova autenticação (apagando dados existentes)
  async logout() {
    try {
      if (this.client && this.isReady) {
        await this.client.logout();
      }

      // Limpar dados de autenticação
      const authPath = path.join("./wwebjs_auth", "barbearia-session");
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
      }

      this.isReady = false;
      this.connectionStatus = "disconnected";
      this.currentQRCode = null;

      // Reiniciar o cliente
      setTimeout(() => {
        this.client.initialize().catch((err) => {
          console.error("Erro ao reinicializar cliente WhatsApp:", err);
        });
      }, 5000);

      return true;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      return false;
    }
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
