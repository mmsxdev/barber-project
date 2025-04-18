import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import api from "../../services/api";
import { validateCPF, formatCPF } from "../../utils/cpfValidator";
import { useAuth } from "../../contexts/useAuth";

function Login() {
  const navigate = useNavigate();
  const [cpfError, setCpfError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleCPFChange = (e) => {
    const input = e.target;
    const formattedCPF = formatCPF(input.value);
    input.value = formattedCPF;

    // Valida o CPF
    const validation = validateCPF(formattedCPF);
    setCpfError(validation.isValid ? "" : validation.message);
  };

  const cpfRef = useRef();
  const passwordRef = useRef();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    // Valida o CPF antes de enviar
    const validation = validateCPF(cpfRef.current.value);
    if (!validation.isValid) {
      setCpfError(validation.message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/login", {
        cpf: cpfRef.current.value.replace(/\D/g, ""), // Remove formatação antes de enviar
        password: passwordRef.current.value,
      });

      // Verifica se o token foi retornado corretamente
      const token = response.data.token;
      if (!token) {
        throw new Error("Token não encontrado na resposta");
      }

      localStorage.setItem("token", token);
      
      // Aguarda o carregamento do usuário antes de redirecionar
      await refreshUser();
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Senha ou CPF inválidos");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4 ">
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 hover:shadow-2xl transition-shadow">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300 mb-2">
            BarberPRO
          </h1>
          <p className="text-slate-200 font-medium">Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="CPF"
                className={`w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border ${
                  cpfError
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                } text-slate-100 placeholder:text-slate-400 transition-all`}
                ref={cpfRef}
                onChange={handleCPFChange}
                maxLength={14}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            {cpfError && <p className="text-red-500 text-sm">{cpfError}</p>}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                className="w-full pl-12 pr-12 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-slate-100 placeholder:text-slate-400 transition-all"
                ref={passwordRef}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!!cpfError || isLoading}
            className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all hover:scale-[1.01] active:scale-95 shadow-lg hover:shadow-xl ${
              cpfError || isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            }`}
          >
            {isLoading ? "Carregando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-slate-300">
          Não tem conta?{" "}
          <Link
            to="/cadastro"
            className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
