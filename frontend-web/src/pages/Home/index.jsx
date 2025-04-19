import { useEffect, useState } from "react";
import {
  Scissors,
  MapPin,
  Smartphone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Sun,
  Moon,
  Phone,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Início", href: "#hero" },
    { name: "Serviços", href: "#servicos" },
    { name: "Equipe", href: "#equipe" },
    { name: "Produtos", href: "#produtos" },
    { name: "Localização", href: "#localizacao" },
    { name: "Contato", href: "#contato" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const whatsappNumber = "5562996535236";
    const message = `Olá! Me chamo ${formData.name} e gostaria de agendar um horário.\n\nTelefone: ${formData.phone}\n\nMensagem: ${formData.message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          : "bg-gradient-to-br from-indigo-900/5 via-blue-500/10 to-purple-500/5 text-gray-800"
      }`}
    >
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:left-4 focus:top-4 focus:rounded-lg"
      >
        Pular para o conteúdo principal
      </a>

      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-lg ${
          scrolled
            ? isDarkMode
              ? "bg-white/10"
              : "bg-white/70 border-b border-white/20 shadow-sm"
            : "bg-transparent"
        }`}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a
              href="#hero"
              className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent"
              aria-label="Barbearia Style - Ir para o início"
            >
              Barbearia Style
            </a>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Abrir menu de navegação"
            >
              <span className="sr-only">Abrir menu</span>
              {/* Ícone do menu aqui */}
            </button>
            <nav className="hidden md:flex space-x-8" aria-label="Menu de navegação">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium hover:text-blue-500 transition-colors"
                  aria-current={window.location.hash === link.href ? "page" : undefined}
                >
                  {link.name}
                </a>
              ))}
            </nav>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
      <section
        id="hero"
        className={`pt-24 pb-12 ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800 to-slate-900"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600 via-indigo-700 to-purple-800"
        }`}
          role="banner"
      >
        <div className="container mx-auto px-6 text-center">
          <h1
            className={`text-5xl font-bold mb-6 animate-fade-in-up ${
              isDarkMode ? "text-white" : "text-gray-900 px-4 py-2"
            }`}
          >
            Bem-vindo à Barbearia Style
          </h1>
          <p
            className={`text-xl mb-8 ${
              isDarkMode ? "text-white/90" : "text-gray-800 px-3 py-1"
            }`}
          >
            Estilo e tradição em cada corte
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/agendar"
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white px-8 py-3 rounded-full hover:from-blue-600 hover:to-violet-600 transition-all w-full sm:w-auto shadow-lg shadow-blue-600/20 font-medium"
                role="button"
                aria-label="Agendar horário online"
            >
              Agendar Online
            </a>
            <a
              href="#contato"
              className={`px-8 py-3 rounded-full transition-all border w-full sm:w-auto font-medium ${
                isDarkMode
                  ? "border-white/30 backdrop-blur-sm bg-white/10 text-white hover:bg-white/20"
                  : "border-slate-900/55 bg-blue-950/30 text-slate-900 hover:bg-blue-800 hover:text-white shadow-md"
              }`}
                role="button"
                aria-label="Entrar em contato com a secretaria"
            >
              Falar com a Secretaria
            </a>
          </div>
        </div>
      </section>
      </main>

      {/* Serviços Section */}
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
                } rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
                role="listitem"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full group-hover:scale-150 transition-all duration-500"></div>
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

      {/* Equipe Section */}
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
                } rounded-xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
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
                    href="https://www.instagram.com/miguelmsx7/?igsh=MTFjejJubG4zaTk1bQ%3D%3D"
                    className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                    aria-label={`Siga ${member} no Instagram`}
                    role="listitem"
                  >
                    <Instagram size={16} aria-hidden="true" />
                  </a>
                  <a
                    href="https://www.instagram.com/miguelmsx7/?igsh=MTFjejJubG4zaTk1bQ%3D%3D"
                    className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                    aria-label={`Siga ${member} no Facebook`}
                    role="listitem"
                  >
                    <Facebook size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos Section */}
      <section
        id="produtos"
        className={`py-20 ${
          isDarkMode ? "bg-slate-800" : "bg-white/95 backdrop-blur-sm"
        }`}
        role="region"
        aria-labelledby="produtos-titulo"
      >
        <div className="container mx-auto px-6">
          <h2 id="produtos-titulo" className="text-3xl font-bold text-center mb-4">
            Nossos Produtos
          </h2>
          <p className="text-center mx-auto max-w-2xl mb-12 text-gray-600">
            Produtos de alta qualidade para cuidar do seu cabelo e barba em casa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
            {[
              {
                name: "Pomada Modeladora",
                price: "R$ 45,90",
                description: "Fixação forte com brilho natural",
                image: "https://placehold.co/300x300/EEE/003366?text=Pomada",
              },
              {
                name: "Óleo para Barba",
                price: "R$ 39,90",
                description: "Hidratação e crescimento saudável",
                image:
                  "https://placehold.co/300x300/EEE/003366?text=Óleo+Barba",
              },
              {
                name: "Shampoo Antiqueda",
                price: "R$ 54,90",
                description: "Combate a queda e caspa",
                image: "https://placehold.co/300x300/EEE/003366?text=Shampoo",
              },
              {
                name: "Kit Barber Pro",
                price: "R$ 129,90",
                description: "Kit completo para cuidados diários",
                image: "https://placehold.co/300x300/EEE/003366?text=Kit+Pro",
              },
            ].map((product, index) => (
              <div
                key={index}
                className={`${
                  isDarkMode
                    ? "bg-white/5"
                    : "bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm border border-white/60"
                } rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group`}
                role="listitem"
              >
                <div className="relative h-60">
                  <img
                    src={product.image}
                    alt={`Imagem do produto ${product.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                    aria-hidden="true"
                  >
                    <span className="text-white font-medium px-4 py-2">
                      Ver detalhes
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p
                    className={
                      isDarkMode
                        ? "text-slate-300"
                        : "text-gray-600 text-sm mb-4"
                    }
                  >
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {product.price}
                    </span>
                    <button 
                      className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                      aria-label={`Adicionar ${product.name} ao carrinho`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Localização Section */}
      <section
        id="localizacao"
        className={`py-20 ${
          isDarkMode
            ? "bg-slate-900"
            : "bg-gradient-to-br from-indigo-100 to-blue-50"
        }`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Nossa Localização
          </h2>
          <p className="text-center mx-auto max-w-2xl mb-12 text-gray-600">
            Visite-nos em nosso endereço e conheça nosso espaço.
          </p>
          <div
            className={`${
              isDarkMode
                ? "bg-white/5"
                : "bg-white/90 backdrop-blur-sm border border-white/60"
            } rounded-xl overflow-hidden shadow-xl`}
          >
            <iframe
              title="Mapa da Barbearia Style"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.075426745292!2d-46.65342658502224!3d-23.565734367638634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1647541561235!5m2!1spt-BR!2sbr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="rounded-xl"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section
        id="contato"
        className={`py-20 ${
          isDarkMode ? "bg-slate-900" : "bg-white/95 backdrop-blur-sm"
        }`}
        role="region"
        aria-labelledby="contato-titulo"
      >
        <div className="container mx-auto px-6">
          <h2 id="contato-titulo" className="text-3xl font-bold text-center mb-4">
            Agende seu Horário
          </h2>
          <p className="text-center mx-auto max-w-2xl mb-12 text-gray-600">
            Entre em contato conosco pelo WhatsApp para agendar seu horário ou tirar dúvidas.
          </p>

          <div className="max-w-xl mx-auto">
            {/* Formulário WhatsApp */}
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulário de agendamento via WhatsApp">
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
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-white border-gray-300"
                  } border focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                  required
                  aria-required="true"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-white border-gray-300"
                  } border focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
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
                      ? "bg-slate-800 border-slate-700 text-white"
                      : "bg-white border-gray-300"
                  } border focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                  required
                  aria-required="true"
                  placeholder="Descreva o serviço desejado e horário preferido"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-600/20 font-medium focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2"
                aria-label="Enviar mensagem pelo WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar pelo WhatsApp
              </button>
            </form>

            {/* Informações Adicionais */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <MapPin className="text-green-500 flex-shrink-0" size={24} aria-hidden="true" />
                <div>
                  <h3 className="font-medium mb-1">Endereço</h3>
                  <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                    Av. Paulista, São Paulo - SP
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Smartphone className="text-green-500 flex-shrink-0" size={24} aria-hidden="true" />
                <div>
                  <h3 className="font-medium mb-1">WhatsApp</h3>
                  <a
                    href="https://wa.me/5562996535236"
                    className={`${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
                    } hover:text-green-500 transition-colors`}
                    aria-label="Iniciar conversa no WhatsApp"
                  >
                    (62) 99653-5236
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 ${
          isDarkMode
            ? "bg-slate-900"
            : "bg-gradient-to-br from-indigo-900 to-blue-900 text-white"
        } border-t border-indigo-800`}
        role="contentinfo"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="space-y-4">
              <a
                href="#hero"
                className="inline-flex items-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                aria-label="Voltar ao topo da página"
              >
                <Scissors className="mr-2 text-blue-400" size={28} aria-hidden="true" />
                Barbearia Style
              </a>
              <p className="text-sm text-indigo-200">
                Transformando vidas através de cortes de cabelo excepcionais e
                atendimento de qualidade.
              </p>
            </div>

            {/* Links Rápidos */}
            <nav className="space-y-4" aria-label="Links rápidos">
              <h3 className="text-lg font-semibold text-white">Links Rápidos</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-indigo-200 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Horário de Funcionamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Horário de Funcionamento</h3>
              <ul className="space-y-2" role="list">
                <li className="text-indigo-200">Segunda a Sexta: 9h às 20h</li>
                <li className="text-indigo-200">Sábado: 9h às 18h</li>
                <li className="text-indigo-200">Domingo: Fechado</li>
              </ul>
            </div>

            {/* Contato e Redes Sociais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contato</h3>
              <address className="not-italic text-indigo-200 space-y-2">
                <p className="flex items-center gap-2">
                  <MapPin size={18} aria-hidden="true" />
                  Av. Paulista, São Paulo - SP
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={18} aria-hidden="true" />
                  <a
                    href="tel:+5511999999999"
                    className="hover:text-white transition-colors"
                  >
                    (11) 99999-9999
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={18} aria-hidden="true" />
                  <a
                    href="mailto:contato@barbeariastyle.com"
                    className="hover:text-white transition-colors"
                  >
                    contato@barbeariastyle.com
                  </a>
                </p>
              </address>

              <div className="pt-4">
                <h4 className="text-sm font-semibold text-white mb-3">Redes Sociais</h4>
                <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/miguelmsx7/?igsh=MTFjejJubG4zaTk1bQ%3D%3D"
                    className="text-indigo-200 hover:text-white transition-colors"
                    aria-label="Siga-nos no Facebook"
                >
                    <Facebook size={20} aria-hidden="true" />
                </a>
                <a
                  href="https://www.instagram.com/miguelmsx7/?igsh=MTFjejJubG4zaTk1bQ%3D%3D"
                    className="text-indigo-200 hover:text-white transition-colors"
                    aria-label="Siga-nos no Instagram"
                >
                    <Instagram size={20} aria-hidden="true" />
                </a>
                <a
                  href="https://www.instagram.com/miguelmsx7/?igsh=MTFjejJubG4zaTk1bQ%3D%3D"
                    className="text-indigo-200 hover:text-white transition-colors"
                    aria-label="Siga-nos no Twitter"
                >
                    <Twitter size={20} aria-hidden="true" />
                </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-indigo-800/50 text-center text-sm text-indigo-200">
            <p>© {new Date().getFullYear()} Barbearia Style. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;