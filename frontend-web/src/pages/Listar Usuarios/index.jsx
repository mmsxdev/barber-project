import api from "../../services/api";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

function UsersList() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      const token = localStorage.getItem("token");
      const {
        data: { users },
      } = await api.get("/listar-usuarios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllUsers(users);
    }
    loadUsers();
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
      } p-4 md:p-6`}
    >
      <button
        onClick={() => navigate("/dashboard")}
        className={`fixed md:absolute top-4 left-4 backdrop-blur-sm p-2 rounded-lg transition-colors z-10 shadow-lg ${
          isDarkMode
            ? "bg-white/10 hover:bg-white/20 text-slate-100"
            : "bg-white/80 hover:bg-white text-gray-700"
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300 text-center mb-8">
          Usuários Cadastrados
        </h1>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allUsers.map((user) => (
            <li
              key={user.cpf}
              className={`group rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow ${
                isDarkMode
                  ? "bg-white/5 backdrop-blur-sm hover:bg-white/10"
                  : "bg-white/80 backdrop-blur-sm hover:bg-white"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-400"
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
                  <h2
                    className={`text-xl font-semibold truncate ${
                      isDarkMode ? "text-slate-100" : "text-gray-900"
                    }`}
                  >
                    {user.name}
                  </h2>
                </div>

                <div className="space-y-2">
                  <p
                    className={`font-mono text-sm px-3 py-1.5 rounded-md truncate ${
                      isDarkMode
                        ? "text-slate-300 bg-black/20"
                        : "text-gray-600 bg-gray-100"
                    }`}
                  >
                    CPF: {user.cpf}
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link
                    to={`/editar-usuario/${user.cpf}`}
                    className={`flex-1 text-center py-2 px-4 rounded-md transition-colors font-medium text-sm ${
                      isDarkMode
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    Editar
                  </Link>
                  <Link
                    to={`/deletar-usuario/${user.cpf}`}
                    className={`flex-1 text-center py-2 px-4 rounded-md transition-colors font-medium text-sm ${
                      isDarkMode
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    Deletar
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UsersList;
