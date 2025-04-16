import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowLeft, RefreshCw } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import axios from "axios";

function WhatsAppAdmin() {
  const { isDarkMode } = useTheme();
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // URL do backend com prioridade para variável de ambiente
  const backendUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://barbearia-backend.onrender.com");

  const fetchQRCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar o status da conexão
      const statusResponse = await axios.get(
        `${backendUrl}/webhook/whatsapp-status`
      );
      if (statusResponse.data.connected) {
        setIsConnected(true);
        setQrCodeImage(null);
        setLoading(false);
        return;
      }

      // Buscar a imagem do QR code
      const qrResponse = await axios.get(
        `${backendUrl}/webhook/whatsapp-qrcode-image`
      );

      if (qrResponse.data.qrCodeImage) {
        setQrCodeImage(qrResponse.data.qrCodeImage);
      } else if (qrResponse.data.error) {
        setError(qrResponse.data.error);
      }

      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar QR code:", err);
      setError(
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
      );
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchQRCode();

    // Atualizar a cada 15 segundos
    const interval = setInterval(fetchQRCode, 15000);
    return () => clearInterval(interval);
  }, [fetchQRCode]);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <header
        className={`shadow-md px-6 py-4 ${
          isDarkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
              <MessageSquare className="mr-2" size={24} />
              WhatsApp Admin
            </h1>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg flex items-center ${
                isDarkMode
                  ? "bg-slate-700 hover:bg-slate-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar para o Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section
          className={`p-6 rounded-lg shadow ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">QR Code do WhatsApp</h2>

          <div
            className={`border rounded-lg overflow-hidden p-8 ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p>Carregando status do WhatsApp...</p>
                </div>
              </div>
            ) : isConnected ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <div
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  ✅ WhatsApp conectado com sucesso!
                </div>
                <p className="text-center">
                  O sistema está pronto para enviar e receber mensagens.
                </p>
              </div>
            ) : error ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <div
                  className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  }`}
                >
                  Erro ao carregar QR code
                </div>
                <p className="text-center mb-4">{error}</p>
                <button
                  onClick={fetchQRCode}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                >
                  <RefreshCw className="mr-2" size={18} />
                  Tentar novamente
                </button>
              </div>
            ) : qrCodeImage ? (
              <div className="flex flex-col items-center justify-center">
                <p className="mb-6 text-center">
                  Escaneie o QR code abaixo com seu WhatsApp para conectar:
                </p>

                <div
                  className={`p-4 bg-white rounded border-2 ${
                    isDarkMode ? "border-slate-600" : "border-gray-300"
                  }`}
                >
                  <img
                    src={qrCodeImage}
                    alt="QR Code WhatsApp"
                    className="max-w-[250px]"
                  />
                </div>

                <div className="mt-8 flex flex-col items-center">
                  <p className="text-center text-sm mb-2">
                    O QR code será atualizado automaticamente a cada 15
                    segundos.
                  </p>
                  <button
                    onClick={fetchQRCode}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                  >
                    <RefreshCw className="mr-2" size={18} />
                    Atualizar QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center">
                <p className="text-center mb-4">
                  Aguardando QR code do WhatsApp...
                </p>
                <p className="text-center text-sm mb-4">
                  Se o QR code não aparecer em alguns segundos, você pode
                  tentar:
                </p>
                <button
                  onClick={fetchQRCode}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                >
                  <RefreshCw className="mr-2" size={18} />
                  Atualizar
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          className={`mt-8 p-6 rounded-lg shadow ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">Instruções</h2>
          <div className="space-y-4">
            <p>
              Após conectar o WhatsApp, o sistema estará habilitado para enviar
              notificações automáticas aos clientes sobre seus agendamentos.
            </p>
            <ol className="list-decimal pl-5 mt-4 space-y-2">
              <li>Aguarde o QR code aparecer na tela</li>
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em Menu (três pontos) ou Configurações</li>
              <li>
                Selecione &quot;Aparelhos conectados&quot; ou &quot;WhatsApp
                Web&quot;
              </li>
              <li>Escaneie o QR code que aparece nesta página</li>
              <li>Quando conectar, você verá uma mensagem de confirmação</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WhatsAppAdmin;
