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
      if (whatsappService.isAuthenticated()) {
        return res.send(
          "<h1>WhatsApp já está autenticado!</h1><p>O serviço de WhatsApp já está conectado e funcionando.</p>"
        );
      } else {
        return res.send(
          "<h1>Aguardando QR Code...</h1><p>Recarregue a página em alguns segundos.</p><script>setTimeout(() => window.location.reload(), 5000);</script>"
        );
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
    res.status(500).send("Erro ao gerar QR code");
  }
});

// Rota para obter o QR Code como JSON (para o frontend)
router.get("/whatsapp-qrcode-data", async (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();
    const isAuthenticated = whatsappService.isAuthenticated();

    res.json({
      authenticated: isAuthenticated,
      qrCode: qrCode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao gerar dados do QR code:", error);
    res.status(500).json({ error: "Erro ao gerar dados do QR code" });
  }
});

// Webhook para receber mensagens do WhatsApp
router.post("/whatsapp", async (req, res) => {
  try {
    // Esta rota será integrada com o sistema de webhook do WhatsApp
    // quando for configurada a API oficial do WhatsApp Business

    // Por enquanto, processamos manualmente através da biblioteca whatsapp-web.js
    // que monitora as mensagens diretamente através da sessão do WA Web

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

export default router;
