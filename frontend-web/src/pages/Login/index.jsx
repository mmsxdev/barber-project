import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const maskCPF = (input) => {
    let cpf = input.value.replace(/\D/g, "");
    cpf = cpf
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{2})$/, "$1-$2");
    input.value = cpf;
  };

  const cpfRef = useRef();
  const passwordRef = useRef();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const {
        data: { token },
      } = await api.post("/login", {
        cpf: cpfRef.current.value,
        password: passwordRef.current.value,
      });
      localStorage.setItem("token", token);
      console.log(token);
      navigate("/dashboard?section=agendamentos");
    } catch (error) {
      error && alert("Senha ou CPF inválidos");
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
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-slate-100 placeholder:text-slate-400 transition-all"
                ref={cpfRef}
                onChange={(e) => maskCPF(e.target)}
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Senha"
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-slate-100 placeholder:text-slate-400 transition-all"
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
            </div>
          </div>

          <button className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-indigo-600 transition-all hover:scale-[1.01] active:scale-95 shadow-lg hover:shadow-xl">
            Entrar
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
