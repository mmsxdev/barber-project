import pkg from "whatsapp-web.js";
const { Client, LocalAuth, RemoteAuth } = pkg;
import qrcode from "qrcode-terminal";
import axios from "axios";
import fs from "fs";
import path from "path";

// Criar uma pasta relativa ou usar um caminho absoluto alternativo
const getAuthPath = () => {
  // Primeiro, tente usar o caminho relativo
  const relativePath = path.resolve("./wwebjs_auth");

  try {
    // Verificar se conseguimos criar a pasta
    if (!fs.existsSync(relativePath)) {
      fs.mkdirSync(relativePath, { recursive: true });
    }

    // Testar se conseguimos escrever na pasta
    const testFile = path.join(relativePath, "test.txt");
    fs.writeFileSync(testFile, "test");
    fs.unlinkSync(testFile);

    return relativePath;
  } catch (err) {
    // Se não conseguir usar o caminho relativo, tente um caminho absoluto
    console.error("Erro ao usar caminho relativo para autenticação:", err);

    // Verificar se estamos no Render
    if (process.env.RENDER) {
      const renderPath = "/tmp/wwebjs_auth";
      if (!fs.existsSync(renderPath)) {
        fs.mkdirSync(renderPath, { recursive: true });
      }
      return renderPath;
    }

    // Em último caso, use o diretório temporário do sistema
    const tempDir = path.join(require("os").tmpdir(), "wwebjs_auth");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
  }
};

// Caminho para dados de autenticação
const AUTH_PATH = getAuthPath();
console.log("Usando diretório de autenticação:", AUTH_PATH);

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.currentQRCode = null;
    this.qrRetries = 0;
    this.maxQrRetries = 10;
    this.connectionStatus = "disconnected";
    this.lastQrTimestamp = null;
    this.initialize();
  }

  initialize() {
    // Garantir que os diretórios existam
    if (!fs.existsSync(AUTH_PATH)) {
      fs.mkdirSync(AUTH_PATH, { recursive: true });
    }

    // Cria o diretório para o cliente específico
    const clientDir = path.join(AUTH_PATH, "barbearia-session");
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }

    // Configurar cliente com suporte MultiDevice explícito
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: AUTH_PATH,
        clientId: "barbearia-session",
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
        timeout: 120000, // Aumentado para 2 minutos
      },
      qrMaxRetries: 10,
      restartOnAuthFail: true,
      qrTimeoutMs: 120000, // 2 minutos para cada QR code
      puppeteerOptions: {
        // Opções adicionais do Puppeteer
        ignoreHTTPSErrors: true,
        slowMo: 0, // Vai mais devagar para evitar problemas
      },
    });

    this.client.on("qr", (qr) => {
      this.connectionStatus = "qr_received";
      console.log("NOVO QR CODE RECEBIDO:");

      // Sempre atualizar o QR code para garantir que o mais recente seja usado
      this.currentQRCode = qr;
      this.lastQrTimestamp = Date.now();
      this.qrRetries++;

      // Mostrar QR code no terminal
      console.log(
        `QR CODE (tentativa ${this.qrRetries}/${this.maxQrRetries}):`
      );
      qrcode.generate(qr, { small: true });

      // Salvar QR code em arquivo
      try {
        // Use a variável global para o caminho
        const qrFilePath = path.join(AUTH_PATH, "current_qr.txt");
        fs.writeFileSync(qrFilePath, qr);
        console.log(`QR code salvo em: ${qrFilePath}`);
      } catch (err) {
        console.error("Erro ao salvar QR code:", err);
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
        if (fs.existsSync(path.join(AUTH_PATH, "current_qr.txt"))) {
          fs.unlinkSync(path.join(AUTH_PATH, "current_qr.txt"));
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
        const authPath = path.join(AUTH_PATH, "barbearia-session");
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

  // Método para obter o caminho de autenticação
  getAuthPath() {
    return AUTH_PATH;
  }

  // Método para forçar nova autenticação (apagando dados existentes)
  async logout() {
    try {
      if (this.client && this.isReady) {
        await this.client.logout();
      }

      // Limpar dados de autenticação
      const authPath = path.join(AUTH_PATH, "barbearia-session");
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
