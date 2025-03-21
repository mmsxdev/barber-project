import api from "../../services/api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function EditUser() {
  const { cpf } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // 👈 Use "BARBER"

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      try {
        const {
          data: { user },
        } = await api.get(`/listar-usuario/${cpf}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(user.name);
        setRole(user.role);
      } catch (error) {
        error && alert("Erro ao carregar usuário!");
        navigate("/listar-usuario");
      }
    }
    loadUser();
  }, [cpf, navigate]);

  async function handleUpdate() {
    const token = localStorage.getItem("token");
    try {
      console.log("Dados enviados:", { name, password, role });
      await api.patch(
        `/editar-usuario/${cpf}`,
        { name, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Usuário atualizado com sucesso!");
      navigate("/listar-usuario");
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error.response?.data);
      if (error.response?.status === 403) {
        alert("Você não tem permissão para esta ação!");
        navigate("/dashboard");
      } else {
        alert(
          `Erro: ${
            error.response?.data?.message || "Erro ao atualizar usuário!"
          }`
        );
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4">
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 hover:shadow-2xl transition-shadow">
        <button
          onClick={() => navigate("/listar-usuario")}
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm p-2 rounded-lg hover:bg-white/20 transition-colors text-slate-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300 mb-2">
            Editar Usuário
          </h1>
          <p className="text-slate-300">Atualize os dados do usuário</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-slate-100 placeholder:text-slate-400 transition-all"
              placeholder="Nome"
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
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-slate-100 appearance-none hover:bg-white/10 transition-colors"
            >
              <option value="ADMIN">Administrador</option>
              <option value="BARBER">Barbeiro</option> {/* 👈 Use "BARBER" */}
              <option value="SECRETARY">Secretária</option>{" "}
              {/* 👈 Use "SECRETARY" */}
            </select>

            {/* Ícone do lado esquerdo */}
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400"
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

            {/* Ícone da seta */}
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-slate-100 placeholder:text-slate-400 transition-all"
              placeholder="Nova Senha"
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <button
            onClick={handleUpdate}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-[1.01] active:scale-95 shadow-lg hover:shadow-xl"
          >
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUser;
