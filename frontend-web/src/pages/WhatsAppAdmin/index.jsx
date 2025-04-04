import { useState, useEffect, useCallback, useRef } from "react";
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
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [resetInProgress, setResetInProgress] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Refs para evitar dependências circulares
  const fetchQrCodeRef = useRef(null);
  const qrCodeDataRef = useRef(null);
  const connectionStatusRef = useRef("disconnected");
  const intervalRef = useRef(null);

  // Manter refs atualizadas
  qrCodeDataRef.current = qrCodeData;
  connectionStatusRef.current = connectionStatus;

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && (!user || user?.role !== "ADMIN")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Formatar status para exibição
  const formatStatus = (status) => {
    const statusMap = {
      disconnected: "Desconectado",
      qr_received: "QR Code Disponível",
      loading: "Carregando",
      authenticated: "Autenticado",
      auth_failure: "Falha na Autenticação",
      ready: "Pronto",
    };
    return statusMap[status] || status;
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    const colorMap = {
      disconnected: "text-red-500 bg-red-50",
      qr_received: "text-blue-500 bg-blue-50",
      loading: "text-yellow-500 bg-yellow-50",
      authenticated: "text-green-500 bg-green-50",
      auth_failure: "text-red-500 bg-red-50",
      ready: "text-green-500 bg-green-50",
    };
    return colorMap[status] || "text-gray-500 bg-gray-50";
  };

  // Buscar QR code do backend
  const fetchQrCode = useCallback(async () => {
    try {
      setDataLoading(true);
      setError(null);

      const response = await api.get("/webhook/whatsapp-qrcode-data");
      const data = response.data;

      setIsWhatsAppReady(data.authenticated);
      setQrCodeData(data.qrCode);
      setConnectionStatus(data.status?.status || "disconnected");
      setLastUpdate(new Date());
    } catch (err) {
      setError("Não foi possível obter o QR Code. Tente novamente.");
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Guardar referência à função fetchQrCode
  fetchQrCodeRef.current = fetchQrCode;

  // Verificar status da conexão
  const checkStatus = useCallback(async () => {
    try {
      const response = await api.get("/webhook/whatsapp-status");
      const data = response.data;

      setIsWhatsAppReady(data.isReady);
      setConnectionStatus(data.status);

      // Se o status mudou para 'ready', buscar QR code para atualizar a tela
      if (data.status === "ready" && connectionStatusRef.current !== "ready") {
        fetchQrCodeRef.current();
      }

      // Se o status mudou para 'qr_received' e não temos QR code, buscar
      if (data.status === "qr_received" && !qrCodeDataRef.current) {
        fetchQrCodeRef.current();
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err);
    }
  }, []);

  // Resetar conexão do WhatsApp
  const resetWhatsAppConnection = async () => {
    try {
      setResetInProgress(true);
      setError(null);

      const response = await api.post("/webhook/whatsapp-reset");

      if (response.data.success) {
        setQrCodeData(null);
        setIsWhatsAppReady(false);
        setConnectionStatus("disconnected");

        // Aguardar um pouco e buscar novo QR code
        setTimeout(() => {
          fetchQrCodeRef.current();
          setResetInProgress(false);
        }, 5000);
      } else {
        setError(
          "Não foi possível resetar a conexão: " + response.data.message
        );
        setResetInProgress(false);
      }
    } catch (err) {
      setError("Erro ao resetar conexão. Tente novamente.");
      console.error(err);
      setResetInProgress(false);
    }
  };

  // Iniciar busca e verificação periódica
  useEffect(() => {
    // Chamar fetchQrCode via ref
    if (fetchQrCodeRef.current) {
      fetchQrCodeRef.current();
    }

    // Verificar status a cada 5 segundos
    const interval = setInterval(() => {
      if (checkStatus) {
        checkStatus();
      }
    }, 5000);

    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkStatus]);

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

        {/* Status da conexão */}
        <div
          className={`rounded-lg p-4 mb-4 ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          } shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Status da Conexão</h2>
              <div
                className={`inline-block px-3 py-1 rounded-full ${getStatusColor(
                  connectionStatus
                )} font-medium`}
              >
                {formatStatus(connectionStatus)}
              </div>
              {lastUpdate && (
                <p className="text-xs mt-1 text-gray-500">
                  Última atualização: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={resetWhatsAppConnection}
              disabled={resetInProgress}
              className={`px-3 py-2 rounded text-white ${
                resetInProgress
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {resetInProgress ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetando...
                </span>
              ) : (
                "Resetar Conexão"
              )}
            </button>
          </div>
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
              onClick={() => fetchQrCodeRef.current()}
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
                <div className="mb-4">
                  <p>
                    Seu sistema está pronto para enviar e receber mensagens pelo
                    WhatsApp.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Para mudar de número, clique no botão &quot;Resetar
                    Conexão&quot; acima.
                  </p>
                </div>
                <button
                  onClick={() => fetchQrCodeRef.current()}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
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
                    <div className="text-sm text-amber-500 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
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
                          <strong>IMPORTANTE:</strong>
                          <br />
                          1. Não recarregue esta página durante o processo
                          <br />
                          2. Após escanear, aguarde até 30 segundos para a
                          confirmação
                          <br />
                          3. Este QR Code é válido por 2 minutos
                          <br />
                          4. Se aparecer erro no WhatsApp, clique em
                          &quot;Resetar Conexão&quot;
                        </span>
                      </p>
                    </div>
                  </div>
                ) : connectionStatus === "loading" ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 w-64 flex items-center justify-center rounded-lg mb-4">
                      <p className="text-gray-500">Carregando WhatsApp...</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-gray-500">Aguardando QR Code...</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left mb-4 text-slate-800 dark:text-slate-200">
                  <h3 className="font-bold mb-2">Como escanear:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em Menu (três pontos) ou Configurações</li>
                    <li>
                      Selecione &quot;Aparelhos conectados&quot; ou
                      &quot;WhatsApp Web&quot;
                    </li>
                    <li>Aponte a câmera para este QR code</li>
                    <li>Aguarde a confirmação (NÃO FECHE A PÁGINA)</li>
                  </ol>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => fetchQrCodeRef.current()}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2"
                  >
                    Atualizar QR Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppAdmin;
