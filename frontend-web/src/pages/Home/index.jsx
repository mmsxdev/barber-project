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
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-lg ${
          scrolled
            ? isDarkMode
              ? "bg-white/10"
              : "bg-white/70 border-b border-white/20 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a
              href="#hero"
              className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent"
            >
              Barbearia Style
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`${
                    isDarkMode
                      ? "text-slate-300 hover:text-blue-400"
                      : "text-gray-700 hover:text-blue-600 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 after:transition-all"
                  } transition-colors font-medium`}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={toggleTheme}
                aria-label={
                  isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"
                }
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "text-slate-300 hover:text-blue-400"
                    : "text-gray-700 hover:text-blue-600 bg-white/30 border border-white/20 shadow-inner"
                } transition-colors`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                aria-label={
                  isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"
                }
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "text-slate-300 hover:text-blue-400"
                    : "text-gray-700 hover:text-blue-600 bg-white/30 border border-white/20"
                } transition-colors`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                className={`p-2 ${
                  isDarkMode
                    ? "text-slate-300 hover:text-blue-400"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div
              className={`md:hidden mt-4 space-y-2 ${
                isDarkMode
                  ? "bg-white/10"
                  : "bg-white/40 backdrop-blur-lg border border-white/20"
              } rounded-lg p-4 shadow-lg`}
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-2 ${
                    isDarkMode
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-gray-700 hover:bg-blue-500/10"
                  } rounded-lg transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className={`pt-24 pb-12 ${
          isDarkMode
            ? "bg-gradient-to-r from-slate-800 to-slate-900"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600 via-indigo-700 to-purple-800"
        }`}
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
            >
              Falar com a Secretaria
            </a>
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section
        id="servicos"
        className={`py-20 ${
          isDarkMode ? "bg-slate-800" : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Nossos Serviços
          </h2>
          <p className="text-center mx-auto max-w-2xl mb-12 text-gray-500">
            Oferecemos serviços de alta qualidade para cuidar do seu estilo com
            precisão e atenção aos detalhes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Tratamento Capilar", "Barba", "Cabelo"].map((service) => (
              <div
                key={service}
                className={`p-6 ${
                  isDarkMode
                    ? "bg-white/5"
                    : "bg-gradient-to-br from-white to-blue-50 backdrop-filter backdrop-blur-sm border border-white/50 shadow-xl"
                } rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full group-hover:scale-150 transition-all duration-500"></div>
                <Scissors
                  className="mb-4 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                  size={32}
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
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Nossa Equipe</h2>
          <p className="text-center mx-auto max-w-2xl mb-12 text-gray-700">
            Profissionais experientes e qualificados para cuidar do seu visual.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["João Silva", "Pedro Almeida", "Carlos Mendes"].map((member) => (
              <div
                key={member}
                className={`text-center ${
                  isDarkMode
                    ? "bg-white/5"
                    : "bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm border border-white/60"
                } rounded-xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="w-40 h-40 mx-auto rounded-full mb-6 overflow-hidden border-4 border-white shadow-lg bg-gradient-to-b from-blue-100 to-white">
                  <div className="w-full h-full bg-gray-200 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold">{member}</h3>
                <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                  Especialista em cortes clássicos
                </p>
                <div className="flex justify-center mt-4 space-x-2">
                  <a
                    href="#"
                    className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                  >
                    <Facebook size={16} />
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
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Nossos Produtos
          </h2>
          <p className="text-center mx-auto max-w-2xl mb-12 text-gray-700">
            Produtos de alta qualidade para cuidar do seu cabelo e barba em
            casa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              >
                <div className="relative h-60">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
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
          <p className="text-center mx-auto max-w-2xl mb-12 text-gray-700">
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.075426745292!2d-46.65342658502224!3d-23.565734367638634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1647541561235!5m2!1spt-BR!2sbr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="rounded-xl"
              title="Localização da Barbearia Style na Avenida Paulista"
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
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Contato</h2>
          <p className="text-center mb-12 max-w-2xl mx-auto text-gray-700">
            Para agendamentos rápidos, use nosso{" "}
            <a
              href="/agendar"
              className="text-blue-700 font-semibold hover:underline"
            >
              sistema online
            </a>
            . Caso prefira falar diretamente com a secretaria, preencha o
            formulário abaixo para iniciar uma conversa pelo WhatsApp.
          </p>

          <div className="flex justify-center px-4">
            <div
              className={`w-full max-w-md ${
                isDarkMode
                  ? "bg-white/5"
                  : "bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm border border-white/60"
              } rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
            >
              <div className="absolute -right-32 -bottom-20 w-64 h-64 bg-blue-500 opacity-10 rounded-full"></div>
              <div className="absolute -left-32 -top-20 w-64 h-64 bg-purple-500 opacity-10 rounded-full"></div>

              <h3 className="text-xl font-semibold mb-6 relative">
                Fale com a Secretaria
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6 relative">
                <div>
                  <label
                    htmlFor="name"
                    className={`block mb-2 font-medium ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg ${
                      isDarkMode
                        ? "bg-white/10 text-white border-slate-600"
                        : "bg-white/80 text-gray-900 border-blue-200 focus:border-blue-400"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className={`block mb-2 font-medium ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg ${
                      isDarkMode
                        ? "bg-white/10 text-white border-slate-600"
                        : "bg-white/80 text-gray-900 border-blue-200 focus:border-blue-400"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className={`block mb-2 font-medium ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Ex: Gostaria de agendar um corte de cabelo para amanhã às 15h"
                    rows="3"
                    className={`w-full px-4 py-3 rounded-lg ${
                      isDarkMode
                        ? "bg-white/10 text-white border-slate-600"
                        : "bg-white/80 text-gray-900 border-blue-200 focus:border-blue-400"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-4 rounded-lg hover:from-blue-600 hover:to-violet-700 transition-all flex items-center justify-center space-x-2 text-lg font-medium shadow-lg shadow-blue-500/20"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.333-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.333 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                  </svg>
                  <span>Agendar via WhatsApp</span>
                </button>
              </form>
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
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="space-y-4">
              <a
                href="#hero"
                className="inline-flex items-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                <Scissors className="mr-2 text-blue-400" size={28} />
                Barbearia Style
              </a>
              <p className="text-sm text-indigo-200">
                Transformando vidas através de cortes de cabelo excepcionais e
                atendimento de qualidade.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                Links Rápidos
              </h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-blue-300 transition-colors text-indigo-200 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horário de Funcionamento */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                Horário de Funcionamento
              </h3>
              <ul className="space-y-2">
                <li className="text-sm text-indigo-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Segunda - Sexta: 09:00 - 20:00
                </li>
                <li className="text-sm text-indigo-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Sábado: 09:00 - 18:00
                </li>
                <li className="text-sm text-indigo-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Domingo: Fechado
                </li>
              </ul>
            </div>

            {/* Contato e Redes Sociais */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <MapPin className="text-blue-400" size={16} />
                  <span className="text-sm text-indigo-200">
                    Av. Paulista, 1000 - São Paulo, SP
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Smartphone className="text-blue-400" size={16} />
                  <span className="text-sm text-indigo-200">
                    (11) 9999-9999
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="text-blue-400" size={16} />
                  <span className="text-sm text-indigo-200">
                    contato@barbeariastyle.com
                  </span>
                </li>
              </ul>
              <div className="mt-6 flex space-x-4">
                <a
                  href="#"
                  className="p-2 rounded-full bg-white/10 hover:bg-blue-500 transition-colors"
                >
                  <Facebook size={18} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-full bg-white/10 hover:bg-blue-500 transition-colors"
                >
                  <Instagram size={18} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-full bg-white/10 hover:bg-blue-500 transition-colors"
                >
                  <Twitter size={18} className="text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-indigo-800/50 text-center text-sm text-indigo-200">
            © {new Date().getFullYear()} Barbearia Style. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
