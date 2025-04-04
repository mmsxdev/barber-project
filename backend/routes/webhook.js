// backend/routes/webhook.js (parte do QR code)
import express from "express";
import whatsappService from "../services/whatsappService.js";
import schedulingService from "../services/schedulingService.js";
import qrcode from "qrcode";

const router = express.Router();

// Rota para obter o QR Code como uma página HTML
router.get("/whatsapp-qrcode", async (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();

    if (!qrCode) {
      // Se não houver QR code (já autenticado ou não inicializado)
      if (whatsappService.isConnected()) {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>WhatsApp Conectado</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 20px; }
              .container { max-width: 500px; margin: 0 auto; }
              h1 { color: #4CAF50; }
              .status { padding: 15px; background-color: #e8f5e9; border-radius: 5px; margin: 20px 0; }
              button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
              button:hover { background-color: #45a049; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>WhatsApp já está conectado!</h1>
              
              <div class="status">
                <p>✅ O serviço de WhatsApp está ativo e pronto para enviar mensagens.</p>
                <p>A secretária não precisa fazer mais nada.</p>
              </div>
              
              <p>Se desejar desconectar o WhatsApp (raramente necessário), use o botão abaixo:</p>
              <button onclick="alert('Função não implementada. Em caso de problemas, contate o suporte técnico.')">Desconectar WhatsApp</button>
            </div>
          </body>
          </html>
        `);
      } else {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Aguardando QR Code</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 20px; }
              .container { max-width: 500px; margin: 0 auto; }
              h1 { color: #2196F3; }
              .loading { padding: 20px; }
              .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #2196F3; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
            <script>setTimeout(() => window.location.reload(), 5000);</script>
          </head>
          <body>
            <div class="container">
              <h1>Aguardando QR Code...</h1>
              <div class="loading">
                <div class="spinner"></div>
                <p>Inicializando o serviço de WhatsApp.<br>Esta página será atualizada automaticamente.</p>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    }

    // Gerar o QR code como imagem/URL
    const qrImageUrl = await qrcode.toDataURL(qrCode);

    // Retornar uma página HTML com o QR code
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autenticação WhatsApp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; }
          h1 { color: #4CAF50; }
          .qr-container { margin: 30px 0; }
          .instructions { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: left; }
          .instructions ol { margin-left: 20px; padding-left: 0; }
          .instructions li { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Autenticação do WhatsApp</h1>
          <p>Escaneie o QR code abaixo com o seu WhatsApp para conectar o serviço:</p>
          
          <div class="qr-container">
            <img src="${qrImageUrl}" alt="QR Code para WhatsApp" style="max-width: 100%; height: auto;">
          </div>
          
          <div class="instructions">
            <h3>Como escanear:</h3>
            <ol>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em Menu (três pontos) ou Configurações</li>
              <li>Selecione "Aparelhos conectados" ou "WhatsApp Web"</li>
              <li>Posicione a câmera do seu celular neste QR code</li>
            </ol>
          </div>
          
          <p><small>Esta página será atualizada automaticamente a cada 30 segundos</small></p>
        </div>
        
        <script>
          // Recarregar a página a cada 30 segundos para obter um novo QR code se necessário
          setTimeout(() => window.location.reload(), 30000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Erro ao gerar QR code:", error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; }
          h1 { color: #f44336; }
          .error { background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; }
          button { background-color: #2196F3; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Erro ao carregar QR Code</h1>
          <div class="error">
            <p>Houve um problema ao gerar o QR code para autenticação do WhatsApp.</p>
            <p>Erro: ${error.message}</p>
          </div>
          <button onclick="window.location.reload()">Tentar novamente</button>
        </div>
      </body>
      </html>
    `);
  }
});

// Rota para verificar o status da conexão do WhatsApp
router.get("/whatsapp-status", (req, res) => {
  try {
    const isConnected = whatsappService.isConnected();
    res.json({ connected: isConnected });
  } catch (error) {
    console.error("Erro ao verificar status do WhatsApp:", error);
    res.status(500).json({ error: "Erro ao verificar status do WhatsApp" });
  }
});

// Rota para obter apenas a imagem do QR Code (para o frontend)
router.get("/whatsapp-qrcode-image", async (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();

    if (!qrCode) {
      return res.status(200).json({
        error: "QR code não disponível",
        isConnected: whatsappService.isConnected(),
      });
    }

    // Gerar o QR code como imagem/URL
    const qrImageUrl = await qrcode.toDataURL(qrCode);

    // Retornar apenas a URL da imagem
    res.json({ qrCodeImage: qrImageUrl });
  } catch (error) {
    console.error("Erro ao gerar QR code:", error);
    res.status(500).json({ error: "Erro ao gerar QR code" });
  }
});

// Webhook para receber mensagens do WhatsApp
router.post("/whatsapp", async (req, res) => {
  try {
    // Esta rota será integrada com o sistema de webhook do WhatsApp
    // quando for configurada a API oficial do WhatsApp Business

    // Por enquanto, processamos manualmente através da biblioteca Baileys
    // que monitora as mensagens diretamente

    res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({ error: "Erro no processamento do webhook" });
  }
});

// Rota para processar mensagens recebidas (chamada pelo serviço WhatsApp)
router.post("/process-message", async (req, res) => {
  try {
    const { from, message } = req.body;

    if (!from) {
      return res
        .status(400)
        .json({ error: "Número de telefone é obrigatório" });
    }

    // Prevenção contra mensagens vazias
    const messageText = message || "";

    // Remover formatação do número de telefone
    const phone = from.replace(/\D/g, "");

    // Verificar se a mensagem é uma confirmação
    const isConfirmation = messageText.trim().toUpperCase() === "CONFIRMAR";
    const isCancellation = messageText.trim().toUpperCase() === "CANCELAR";

    if (!isConfirmation && !isCancellation) {
      return res.status(200).json({
        message: "Mensagem recebida, mas não é uma confirmação ou cancelamento",
      });
    }

    // Buscar agendamento pelo telefone
    const schedulings = await schedulingService.getSchedulingByPhone(phone);

    if (!schedulings || schedulings.length === 0) {
      return res.status(404).json({
        message: "Nenhum agendamento pendente encontrado para este número",
      });
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

      await whatsappService.sendMessage(phone, confirmMessage);

      return res
        .status(200)
        .json({ message: "Agendamento confirmado com sucesso" });
    } else if (isCancellation) {
      // Cancelar agendamento
      await schedulingService.cancelScheduling(scheduling.id);

      // Enviar mensagem de cancelamento
      const cancelMessage =
        `*Agendamento Cancelado*\n\n` +
        `Seu agendamento foi cancelado conforme solicitado.\n` +
        `Para reagendar, visite nosso site ou entre em contato conosco.\n\n` +
        `*Barbearia Style*`;

      await whatsappService.sendMessage(phone, cancelMessage);

      return res
        .status(200)
        .json({ message: "Agendamento cancelado com sucesso" });
    }

    res.status(200).json({ message: "Mensagem processada com sucesso" });
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    res.status(500).json({ error: "Erro ao processar mensagem" });
  }
});

// Rota para enviar mensagem de teste (útil para verificar se o WhatsApp está funcionando)
router.post("/send-test-message", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ error: "Número de telefone é obrigatório" });
    }

    const testMessage =
      "*Teste de Mensagem - Barbearia Style*\n\n" +
      "Esta é uma mensagem de teste enviada pelo sistema de agendamentos da Barbearia Style.\n\n" +
      "Se você recebeu esta mensagem, significa que o sistema está funcionando corretamente! 👍";

    const success = await whatsappService.sendMessage(phoneNumber, testMessage);

    if (success) {
      res
        .status(200)
        .json({ message: "Mensagem de teste enviada com sucesso" });
    } else {
      res.status(500).json({ error: "Erro ao enviar mensagem de teste" });
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem de teste:", error);
    res.status(500).json({ error: "Erro ao enviar mensagem de teste" });
  }
});

export default router;
