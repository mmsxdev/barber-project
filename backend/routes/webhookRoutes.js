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
