import { memo } from 'react';
import { MapPin, Smartphone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const ContactSection = memo(({ isDarkMode, formData, handleSubmit, handleChange }) => {
  return (
    <section
      id="contato"
      className={`py-20 ${
        isDarkMode ? "bg-slate-900" : "bg-white/95 backdrop-blur-sm"
      }`}
      role="region"
      aria-labelledby="contato-titulo"
    >
      <div className="container mx-auto px-6">
        <h2 id="contato-titulo" className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          Entre em Contato
        </h2>
        <p className="text-center mx-auto max-w-2xl mb-12 text-gray-600">
          Envie sua mensagem ou entre em contato através dos nossos canais de atendimento.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulário */}
          <div className={`${
            isDarkMode
              ? "bg-slate-800/50"
              : "bg-white"
          } p-8 rounded-2xl shadow-xl border border-gray-200/20 backdrop-blur-sm`}>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Mail className="text-green-500" size={24} />
              Envie sua Mensagem
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulário de contato">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-gray-50 border-gray-200"
                  } border focus:ring-2 focus:ring-green-500 outline-none transition-all`}
                  required
                  aria-required="true"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-gray-50 border-gray-200"
                  } border focus:ring-2 focus:ring-green-500 outline-none transition-all`}
                  required
                  aria-required="true"
                  placeholder="(00) 00000-0000"
                  pattern="^\(\d{2}\) \d{5}-\d{4}$"
                  aria-describedby="phone-format"
                />
                <span id="phone-format" className="text-xs text-gray-500 mt-1">
                  Formato: (00) 00000-0000
                </span>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-gray-50 border-gray-200"
                  } border focus:ring-2 focus:ring-green-500 outline-none transition-all`}
                  required
                  aria-required="true"
                  placeholder="Digite sua mensagem"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg transition-all shadow-lg shadow-green-500/20 font-medium focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2 text-lg transform-gpu hover:scale-[1.02] active:scale-[0.98]"
                aria-label="Enviar mensagem pelo WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar no WhatsApp
              </button>
            </form>
          </div>

          {/* Informações de Contato */}
          <div className={`${
            isDarkMode
              ? "bg-slate-800/50"
              : "bg-white"
          } p-8 rounded-2xl shadow-xl border border-gray-200/20 backdrop-blur-sm space-y-8`}>
            <h3 className="text-2xl font-semibold mb-6">Informações de Contato</h3>
            
            <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-violet-500/10">
              <MapPin className="text-blue-500 flex-shrink-0" size={24} aria-hidden="true" />
              <div>
                <h4 className="font-medium mb-1">Endereço</h4>
                <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                  Av. Paulista, São Paulo - SP
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-violet-500/10">
              <Smartphone className="text-blue-500 flex-shrink-0" size={24} aria-hidden="true" />
              <div>
                <h4 className="font-medium mb-1">Telefone</h4>
                <a
                  href="tel:+5511999999999"
                  className={`${
                    isDarkMode ? "text-slate-300" : "text-gray-600"
                  } hover:text-blue-500 transition-colors`}
                >
                  (11) 99999-9999
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-violet-500/10">
              <Mail className="text-blue-500 flex-shrink-0" size={24} aria-hidden="true" />
              <div>
                <h4 className="font-medium mb-1">E-mail</h4>
                <a
                  href="mailto:contato@barbeariastyle.com"
                  className={`${
                    isDarkMode ? "text-slate-300" : "text-gray-600"
                  } hover:text-blue-500 transition-colors`}
                >
                  contato@barbeariastyle.com
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200/20">
              <h4 className="font-medium mb-4">Redes Sociais</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 transition-all shadow-lg transform-gpu hover:scale-110"
                  aria-label="Siga-nos no Facebook"
                >
                  <Facebook size={20} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 transition-all shadow-lg transform-gpu hover:scale-110"
                  aria-label="Siga-nos no Instagram"
                >
                  <Instagram size={20} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 transition-all shadow-lg transform-gpu hover:scale-110"
                  aria-label="Siga-nos no Twitter"
                >
                  <Twitter size={20} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection; 