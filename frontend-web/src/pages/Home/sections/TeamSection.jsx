import { memo } from 'react';
import { Instagram, Facebook } from 'lucide-react';

const TeamSection = memo(({ isDarkMode }) => {
  return (
    <section
      id="equipe"
      className={`py-20 ${
        isDarkMode
          ? "bg-slate-900"
          : "bg-gradient-to-br from-indigo-100 to-blue-50"
      }`}
      role="region"
      aria-labelledby="equipe-titulo"
    >
      <div className="container mx-auto px-6">
        <h2 id="equipe-titulo" className="text-3xl font-bold text-center mb-4">Nossa Equipe</h2>
        <p className="text-center mx-auto max-w-2xl mb-12 text-gray-600">
          Profissionais experientes e qualificados para cuidar do seu visual.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          {["João Silva", "Pedro Almeida", "Carlos Mendes"].map((member) => (
            <div
              key={member}
              className={`text-center ${
                isDarkMode
                  ? "bg-white/5"
                  : "bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm border border-white/60"
              } rounded-xl p-8 shadow-xl transform-gpu hover:-translate-y-1 transition-transform duration-300`}
              role="listitem"
            >
              <div 
                className="w-40 h-40 mx-auto rounded-full mb-6 overflow-hidden border-4 border-white shadow-lg bg-gradient-to-b from-blue-100 to-white"
                role="img"
                aria-label={`Foto do profissional ${member}`}
              >
                <div className="w-full h-full bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold">{member}</h3>
              <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                Especialista em cortes clássicos
              </p>
              <div className="flex justify-center mt-4 space-x-2" role="list" aria-label="Redes sociais">
                <a
                  href="#"
                  className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transform-gpu hover:scale-110 transition-transform duration-300"
                  aria-label={`Siga ${member} no Instagram`}
                >
                  <Instagram size={16} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transform-gpu hover:scale-110 transition-transform duration-300"
                  aria-label={`Siga ${member} no Facebook`}
                >
                  <Facebook size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

TeamSection.displayName = 'TeamSection';

export default TeamSection; 