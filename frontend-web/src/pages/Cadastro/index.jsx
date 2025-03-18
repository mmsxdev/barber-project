import { Link } from "react-router-dom";
import { useRef } from "react";
import api from "../../services/api";

function Cadastro() {
  const maskCPF = (input) => {
    let cpf = input.value.replace(/\D/g, "");
    cpf = cpf
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{2})$/, "$1-$2");
    input.value = cpf;
  };

  const nameRef = useRef();
  const cpfRef = useRef();
  const passwordRef = useRef();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await api.post("/cadastro", {
        name: nameRef.current.value,
        cpf: cpfRef.current.value,
        password: passwordRef.current.value,
      });
      alert("Usuário cadastrado com sucesso");
    } catch (error) {
      error && alert("Erro ao cadastrar usuário");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4 ">
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 hover:shadow-2xl transition-shadow">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-300 mb-2">
            Novo Cadastro
          </h1>
          <p className="text-slate-200 font-medium">
            Crie sua conta gratuitamente
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {[
              { icon: "user", placeholder: "Nome completo", ref: nameRef },
              {
                icon: "id-card",
                placeholder: "CPF",
                ref: cpfRef,
                maxLength: 14,
              },
              {
                icon: "lock",
                placeholder: "Senha",
                ref: passwordRef,
                type: "password",
              },
            ].map((field, index) => (
              <div key={index} className="relative">
                <input
                  ref={field.ref}
                  placeholder={field.placeholder}
                  type={field.type || "text"}
                  maxLength={field.maxLength}
                  onChange={
                    field.placeholder === "CPF"
                      ? (e) => maskCPF(e.target)
                      : undefined
                  }
                  className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 text-slate-100 placeholder:text-slate-400 transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {field.icon === "user" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  )}
                  {field.icon === "id-card" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  )}
                  {field.icon === "lock" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  )}
                </svg>
              </div>
            ))}
          </div>

          <button className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-blue-600 transition-all hover:scale-[1.01] active:scale-95 shadow-lg hover:shadow-xl">
            Cadastrar
          </button>
        </form>

        <p className="text-center text-slate-300">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Fazer Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
