import { useNavigate } from "react-router-dom";

export const PermissionError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center space-y-6">
        <h2 className="text-2xl font-bold text-red-400">Acesso Negado</h2>
        <p className="text-slate-300">
          Você não tem permissão para acessar esta página.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 bg-blue-500 rounded-lg font-semibold text-white hover:bg-blue-600 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};
