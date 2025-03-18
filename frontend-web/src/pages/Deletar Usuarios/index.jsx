import api from "../../services/api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function DeleteUser() {
  const { cpf } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      try {
        const {
          data: { user },
        } = await api.get(`/listar-usuario/${cpf}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(user);
      } catch (error) {
        error && alert("Erro ao carregar usuário!");
        navigate("/listar-usuario");
      }
    }
    loadUser();
  }, [cpf, navigate]);

  async function handleDelete() {
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/deletar-usuario/${cpf}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Usuário deletado com sucesso!");
      navigate("/listar-usuario");
    } catch (error) {
      error && alert("Erro ao deletar usuário!");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 hover:shadow-2xl transition-shadow">
        <button
          onClick={() => navigate("/listar-usuario")}
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm p-2 rounded-lg hover:bg-white/20 transition-colors text-slate-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center space-y-2">
          <svg
            className="mx-auto w-12 h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-300">
            Confirmar Exclusão
          </h1>
        </div>

        {user && (
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl border border-red-400/20">
              <p className="text-slate-200 text-center">
                <span className="block text-lg font-semibold text-red-200">
                  {user.name}
                </span>
                <span className="text-sm font-mono opacity-75">{user.cpf}</span>
              </p>
            </div>

            <div className="grid gap-3">
              <button
                onClick={handleDelete}
                className="w-full py-3.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-semibold text-white hover:from-red-600 hover:to-pink-600 transition-all hover:scale-[1.01] active:scale-95 shadow-lg hover:shadow-xl"
              >
                Confirmar Exclusão
              </button>

              <button
                onClick={() => navigate("/listar-usuario")}
                className="w-full py-3.5 bg-transparent border border-red-400/30 text-red-300 rounded-lg font-semibold hover:bg-red-500/10 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteUser;
