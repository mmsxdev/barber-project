import { useEffect, useState } from "react";

function WelcomeDashboard() {
  const [isVisible, setIsVisible] = useState(false);

  // Efeito para animação de entrada
  useEffect(() => {
    // Ativa a animação após um pequeno delay para garantir que o componente esteja renderizado
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Delay de 100ms
    return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="text-center">
        {/* Título com Gradiente e Animação */}
        <h1
          className={`text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent transition-all duration-1000 ease-in-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          BarberPRO
        </h1>

        {/* Mensagem de Boas-Vindas com Animação */}
        <p
          className={`mt-6 text-xl text-slate-300 transition-all duration-1000 ease-in-out delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          Bem-vindo ao seu painel de controle.
        </p>
        <p
          className={`mt-3 text-lg text-slate-400 transition-all duration-1000 ease-in-out delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          Gerencie sua barbearia com facilidade e estilo.
        </p>

        {/* Ícones Decorativos com Animação */}
        <div
          className={`mt-10 flex justify-center space-x-6 transition-all duration-1000 ease-in-out delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="p-5 bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow text-3xl">
            ✂️
          </div>
          <div className="p-5 bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow text-3xl">
            💈
          </div>
          <div className="p-5 bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow text-3xl">
            🪒
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeDashboard;
