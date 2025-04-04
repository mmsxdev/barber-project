// Rota para obter o QR code para autenticação do WhatsApp
router.get("/whatsapp-qrcode-data", (req, res) => {
  const qrCode = whatsappService.getQRCode();
  const isAuthenticated = whatsappService.isAuthenticated();
  const status = whatsappService.getConnectionStatus();

  return res.json({
    authenticated: isAuthenticated,
    qrCode: qrCode,
    status: status,
  });
});

// Nova rota para obter o status da conexão WhatsApp
router.get("/whatsapp-status", (req, res) => {
  const status = whatsappService.getConnectionStatus();
  return res.json(status);
});

// Nova rota para forçar logout e nova autenticação do WhatsApp
router.post("/whatsapp-reset", async (req, res) => {
  try {
    const result = await whatsappService.logout();
    return res.json({
      success: result,
      message: result
        ? "WhatsApp desconectado. Você pode escanear um novo QR code."
        : "Não foi possível desconectar o WhatsApp.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao resetar o WhatsApp",
      error: error.message,
    });
  }
});

// Nova rota para obter o QR code como imagem
router.get("/whatsapp-qrcode-image", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const QRCode = require("qrcode");

    // Importar a constante AUTH_PATH do serviço WhatsApp
    const { default: whatsappService } = await import(
      "../services/whatsappService.js"
    );

    // Usar o mesmo caminho do serviço WhatsApp
    const authPath = whatsappService.getAuthPath();
    const qrFilePath = path.join(authPath, "current_qr.txt");

    console.log(`[DEBUG] Buscando QR code em: ${qrFilePath}`);

    if (!fs.existsSync(qrFilePath)) {
      console.log(`[ERROR] Arquivo QR code não encontrado em: ${qrFilePath}`);
      return res.status(404).json({
        success: false,
        message: "QR code não encontrado. Tente novamente em alguns instantes.",
      });
    }

    // Ler o QR code do arquivo
    const qrData = fs.readFileSync(qrFilePath, "utf8");
    console.log(
      `[DEBUG] QR code lido com sucesso (tamanho: ${qrData.length} caracteres)`
    );

    // Gerar imagem do QR code
    const qrImageBuffer = await QRCode.toBuffer(qrData);
    console.log(
      `[DEBUG] Imagem QR code gerada com sucesso (tamanho: ${qrImageBuffer.length} bytes)`
    );

    // Enviar como imagem
    res.set("Content-Type", "image/png");
    return res.send(qrImageBuffer);
  } catch (error) {
    console.error("Erro ao gerar imagem do QR code:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao gerar imagem do QR code",
    });
  }
});
