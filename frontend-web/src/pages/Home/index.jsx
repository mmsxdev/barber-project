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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/agendar"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all w-full sm:w-auto"
            >
              Agendar Online
            </a>
            <a
              href="#contato"
              className={`px-8 py-3 rounded-lg transition-all border w-full sm:w-auto ${
                isDarkMode
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
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
        className={`py-20 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Contato</h2>
          <p className="text-center mb-12 max-w-2xl mx-auto">
            Para agendamentos rápidos, use nosso{" "}
            <a
              href="/agendar"
              className="text-blue-500 font-semibold hover:underline"
            >
              sistema online
            </a>
            . Caso prefira falar diretamente com a secretaria, preencha o
            formulário abaixo para iniciar uma conversa pelo WhatsApp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div
              className={`${
                isDarkMode ? "bg-white/5" : "bg-gray-50"
              } backdrop-blur-lg rounded-xl p-6 hover:shadow-xl transition-all`}
            >
              <h3 className="text-xl font-semibold mb-4">
                Fale com a Secretaria
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className={`block mb-1 ${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
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
                    className={`w-full px-3 py-2 rounded-lg ${
                      isDarkMode
                        ? "bg-white/10 text-white border-slate-600"
                        : "bg-gray-50 text-gray-900 border-gray-300"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className={`block mb-1 ${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
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
                    className={`w-full px-3 py-2 rounded-lg ${
                      isDarkMode
                        ? "bg-white/10 text-white border-slate-600"
                        : "bg-gray-50 text-gray-900 border-gray-300"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className={`block mb-1 ${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
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
                    className={`w-full px-3 py-2 rounded-lg ${
                      isDarkMode
                        ? "bg-white/10 text-white border-slate-600"
                        : "bg-gray-50 text-gray-900 border-gray-300"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2 text-lg font-medium"
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
          isDarkMode ? "bg-slate-900" : "bg-gray-100"
        } border-t ${isDarkMode ? "border-slate-800" : "border-gray-200"}`}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="space-y-4">
              <a
                href="#hero"
                className="inline-flex items-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent"
              >
                <Scissors className="mr-2" size={28} />
                Barbearia Style
              </a>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                Transformando vidas através de cortes de cabelo excepcionais e
                atendimento de qualidade.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Links Rápidos
              </h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className={`text-sm hover:text-blue-400 transition-colors ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horário de Funcionamento */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Horário de Funcionamento
              </h3>
              <ul className="space-y-2">
                <li
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Segunda - Sexta: 09:00 - 20:00
                </li>
                <li
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Sábado: 09:00 - 18:00
                </li>
                <li
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Domingo: Fechado
                </li>
              </ul>
            </div>

            {/* Contato e Redes Sociais */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Contato
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <MapPin className="text-blue-400" size={16} />
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    Av. Paulista, 1000 - São Paulo, SP
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Smartphone className="text-blue-400" size={16} />
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    (11) 9999-9999
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="text-blue-400" size={16} />
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    contato@barbeariastyle.com
                  </span>
                </li>
              </ul>
              <div className="mt-6 flex space-x-4">
                <a
                  href="#"
                  className={`p-2 rounded-full ${
                    isDarkMode ? "bg-white/10" : "bg-white"
                  } hover:bg-blue-400 transition-colors`}
                >
                  <Facebook
                    size={18}
                    className={isDarkMode ? "text-slate-300" : "text-gray-600"}
                  />
                </a>
                <a
                  href="#"
                  className={`p-2 rounded-full ${
                    isDarkMode ? "bg-white/10" : "bg-white"
                  } hover:bg-blue-400 transition-colors`}
                >
                  <Instagram
                    size={18}
                    className={isDarkMode ? "text-slate-300" : "text-gray-600"}
                  />
                </a>
                <a
                  href="#"
                  className={`p-2 rounded-full ${
                    isDarkMode ? "bg-white/10" : "bg-white"
                  } hover:bg-blue-400 transition-colors`}
                >
                  <Twitter
                    size={18}
                    className={isDarkMode ? "text-slate-300" : "text-gray-600"}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div
            className={`mt-12 pt-8 border-t text-center text-sm ${
              isDarkMode
                ? "border-slate-800 text-slate-400"
                : "border-gray-200 text-gray-500"
            }`}
          >
            © {new Date().getFullYear()} Barbearia Style. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
