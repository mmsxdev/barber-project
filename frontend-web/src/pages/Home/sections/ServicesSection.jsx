import { memo } from 'react';
import { Scissors } from 'lucide-react';

const ServicesSection = memo(({ isDarkMode }) => {
  return (
    <section
      id="servicos"
      className={`py-20 ${
        isDarkMode ? "bg-slate-800" : "bg-white/95 backdrop-blur-sm"
      }`}
      role="region"
      aria-labelledby="servicos-titulo"
    >
      <div className="container mx-auto px-6">
        <h2 id="servicos-titulo" className="text-3xl font-bold text-center mb-4">
          Nossos Serviços
        </h2>
        <p className="text-center mx-auto max-w-2xl mb-12 text-gray-400">
          Oferecemos serviços de alta qualidade para cuidar do seu estilo com
          precisão e atenção aos detalhes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          {["Tratamento Capilar", "Barba", "Cabelo"].map((service) => (
            <div
              key={service}
              className={`p-6 ${
                isDarkMode
                  ? "bg-white/5"
                  : "bg-gradient-to-br from-white to-blue-50 backdrop-filter backdrop-blur-sm border border-white/50 shadow-xl"
              } rounded-xl hover:shadow-2xl transform-gpu hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden`}
              role="listitem"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full transform-gpu group-hover:scale-150 transition-transform duration-500"></div>
              <Scissors
                className="mb-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                size={32}
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold mb-2">{service}</h3>
              <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                Descrição breve do serviço oferecido pela barbearia.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';

export default ServicesSection; 