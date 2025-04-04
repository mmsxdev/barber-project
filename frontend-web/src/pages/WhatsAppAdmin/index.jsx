import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import QRCode from "react-qr-code";

const WhatsAppAdmin = () => {
  const { isDarkMode } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isWhatsAppReady, setIsWhatsAppReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && (!user || user?.role !== "ADMIN")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Buscar QR code do backend
  const fetchQrCode = async () => {
    try {
      setDataLoading(true);
      setError(null);

      const response = await api.get("/webhook/whatsapp-qrcode-data");
      const data = response.data;

      setIsWhatsAppReady(data.authenticated);
      setQrCodeData(data.qrCode);
    } catch (err) {
      setError("Não foi possível obter o QR Code. Tente novamente.");
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  // Iniciar busca e atualização periódica
  useEffect(() => {
    fetchQrCode();

    // Atualizar o QR code a cada 60 segundos se não estiver autenticado
    const interval = setInterval(() => {
      if (!isWhatsAppReady) {
        fetchQrCode();
      }
    }, 60000); // Aumentado para 60 segundos (60000ms)

    return () => clearInterval(interval);
  }, [isWhatsAppReady]);

  return (
    <div
      className={`min-h-screen p-4 ${
        isDarkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configuração do WhatsApp</h1>
          <Link
            to="/dashboard"
            className={`inline-flex items-center px-3 py-2 rounded ${
              isDarkMode
                ? "bg-slate-800 hover:bg-slate-700"
                : "bg-white hover:bg-gray-100 shadow-sm"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar ao Dashboard
          </Link>
        </div>

        {dataLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchQrCode}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!dataLoading && !error && (
          <div
            className={`rounded-lg p-6 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } shadow-lg`}
          >
            {isWhatsAppReady ? (
              <div className="text-center">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                  <h2 className="text-xl font-bold">WhatsApp Conectado!</h2>
                  <p>O serviço de WhatsApp está funcionando corretamente.</p>
                </div>
                <p>
                  Seu sistema está pronto para enviar e receber mensagens pelo
                  WhatsApp.
                </p>
                <button
                  onClick={fetchQrCode}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Verificar status
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Escaneie o QR Code</h2>
                <p className="mb-4">
                  Para ativar a integração com o WhatsApp, escaneie o QR code
                  abaixo usando seu celular:
                </p>

                {qrCodeData ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <QRCode value={qrCodeData} size={256} />
                    </div>
                    <div className="text-sm text-amber-500 mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="flex items-start">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <span>
                          <strong>IMPORTANTE:</strong> Não recarregue esta
                          página enquanto estiver escaneando. Após escanear,
                          aguarde até 20 segundos para a confirmação. Se
                          aparecer erro no WhatsApp, tente novamente depois de 1
                          minuto.
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-gray-500">QR Code não disponível</p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg text-left mb-4 text-slate-800">
                  <h3 className="font-bold mb-2 ">Como escanear:</h3>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em Menu (três pontos) ou Configurações</li>
                    <li>
                      Selecione &quot;Aparelhos conectados&quot; ou
                      &quot;WhatsApp Web&quot;
                    </li>
                    <li>Aponte a câmera para este QR code</li>
                  </ol>
                </div>

                <p className="text-sm text-gray-500">
                  Este QR code será atualizado automaticamente a cada 60
                  segundos.
                </p>
                <button
                  onClick={fetchQrCode}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Atualizar QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppAdmin;
