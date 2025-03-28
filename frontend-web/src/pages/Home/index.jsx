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

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          : "bg-gradient-to-br from-white to-gray-100 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-lg ${
          scrolled
            ? isDarkMode
              ? "bg-white/10"
              : "bg-white/80"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a
              href="#hero"
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent"
            >
              <Scissors className="inline-block mr-2" size={28} />
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
                      : "text-gray-600 hover:text-blue-600"
                  } transition-colors`}
                >
                  {link.name}
                </a>
              ))}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "text-slate-300 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-600"
                } transition-colors`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "text-slate-300 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-600"
                } transition-colors`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className={`p-2 ${
                  isDarkMode
                    ? "text-slate-300 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-600"
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
                isDarkMode ? "bg-white/10" : "bg-white/80"
              } backdrop-blur-lg rounded-lg p-4`}
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`block px-4 py-2 ${
                    isDarkMode
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-gray-600 hover:bg-gray-100"
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
            : "bg-gradient-to-r from-gray-100 to-white"
        }`}
      >
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in-up">
            Bem-vindo à Barbearia Style
          </h1>
          <p
            className={`text-xl mb-8 ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            Estilo e tradição em cada corte
          </p>
          <a
            href="#contato"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Agendar Horário
          </a>
        </div>
      </section>

      {/* Serviços Section */}
      <section
        id="servicos"
        className={`py-20 ${isDarkMode ? "bg-slate-800" : "bg-gray-50"}`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Tratamento Capilar", "Barba", "Cabelo"].map((service) => (
              <div
                key={service}
                className={`p-6 ${
                  isDarkMode ? "bg-white/5" : "bg-white"
                } backdrop-blur-lg rounded-xl hover:shadow-xl transition-all`}
              >
                <Scissors className="mb-4 text-blue-400" size={32} />
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
        className={`py-20 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Nossa Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["João Silva", "Pedro Almeida", "Carlos Mendes"].map((member) => (
              <div
                key={member}
                className={`text-center ${
                  isDarkMode ? "bg-white/5" : "bg-gray-50"
                } backdrop-blur-lg rounded-xl p-6 hover:shadow-xl transition-all`}
              >
                <div className="w-48 h-48 mx-auto bg-gray-200 rounded-full mb-4"></div>
                <h3 className="text-xl font-semibold">{member}</h3>
                <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>
                  Especialista em cortes clássicos
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos Section */}
      <section
        id="produtos"
        className={`py-20 ${isDarkMode ? "bg-slate-800" : "bg-gray-50"}`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossos Produtos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Pomada Modeladora",
                price: "R$ 45,90",
                description: "Fixação forte com brilho natural",
                image:
                  "https://via.placeholder.com/300x300/EEE/003366?text=Pomada",
              },
              {
                name: "Óleo para Barba",
                price: "R$ 39,90",
                description: "Hidratação e crescimento saudável",
                image:
                  "https://via.placeholder.com/300x300/EEE/003366?text=Óleo+Barba",
              },
              {
                name: "Shampoo Antiqueda",
                price: "R$ 54,90",
                description: "Combate a queda e caspa",
                image:
                  "https://via.placeholder.com/300x300/EEE/003366?text=Shampoo",
              },
              {
                name: "Kit Barber Pro",
                price: "R$ 129,90",
                description: "Kit completo para cuidados diários",
                image:
                  "https://via.placeholder.com/300x300/EEE/003366?text=Kit+Pro",
              },
            ].map((product, index) => (
              <div
                key={index}
                className={`${
                  isDarkMode ? "bg-white/5" : "bg-white"
                } backdrop-blur-lg rounded-xl overflow-hidden hover:shadow-xl transition-all`}
              >
                <div className="relative h-60">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p
                    className={`${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
                    } text-sm mb-4`}
                  >
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-400">
                      {product.price}
                    </span>
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
        className={`py-20 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossa Localização
          </h2>
          <div
            className={`${
              isDarkMode ? "bg-white/5" : "bg-gray-50"
            } backdrop-blur-lg rounded-xl overflow-hidden`}
          >
            <iframe
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
        className={`py-20 ${isDarkMode ? "bg-slate-800" : "bg-gray-50"}`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Entre em Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className={`${
                isDarkMode ? "bg-white/5" : "bg-white"
              } backdrop-blur-lg rounded-xl p-6`}
            >
              <h3 className="text-xl font-semibold mb-4">
                Informações de Contato
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-blue-400" size={20} />
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-gray-600"}
                  >
                    Av. Paulista, 1000 - São Paulo, SP
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone className="text-blue-400" size={20} />
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-gray-600"}
                  >
                    (11) 9999-9999
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-blue-400" size={20} />
                  <span
                    className={isDarkMode ? "text-slate-300" : "text-gray-600"}
                  >
                    contato@barbeariastyle.com
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`${
                isDarkMode ? "bg-white/5" : "bg-white"
              } backdrop-blur-lg rounded-xl p-6`}
            >
              <h3 className="text-xl font-semibold mb-4">Redes Sociais</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "text-slate-300 hover:text-blue-400"
                      : "text-gray-600 hover:text-blue-600"
                  } transition-colors`}
                >
                  <Facebook size={24} />
                </a>
                <a
                  href="#"
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "text-slate-300 hover:text-blue-400"
                      : "text-gray-600 hover:text-blue-600"
                  } transition-colors`}
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="#"
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "text-slate-300 hover:text-blue-400"
                      : "text-gray-600 hover:text-blue-600"
                  } transition-colors`}
                >
                  <Twitter size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
