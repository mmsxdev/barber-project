import { useEffect, useState, lazy, Suspense } from "react";
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

// Lazy load sections that are not immediately visible
const ServicesSection = lazy(() => import("./sections/ServicesSection"));
const TeamSection = lazy(() => import("./sections/TeamSection"));
const ProductsSection = lazy(() => import("./sections/ProductsSection"));
const ContactSection = lazy(() => import("./sections/ContactSection"));

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  // Optimize scroll event listener with throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 50;
          setScrolled(isScrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoize navLinks to prevent unnecessary re-renders
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
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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

      {/* Navbar - Optimized with reduced opacity animations */}
      <nav
        className={`fixed w-full z-50 transition-colors duration-300 ${
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

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
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

        {/* Lazy loaded sections with loading fallback */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center">Carregando...</div>}>
          <ServicesSection isDarkMode={isDarkMode} />
          <TeamSection isDarkMode={isDarkMode} />
          <ProductsSection isDarkMode={isDarkMode} />
          <ContactSection 
            isDarkMode={isDarkMode} 
            formData={formData}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
          />
        </Suspense>
      </main>

      {/* Footer - Optimized with reduced animations */}
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
                  href="#"
                    className="text-indigo-200 hover:text-white transition-colors"
                    aria-label="Siga-nos no Facebook"
                >
                    <Facebook size={20} aria-hidden="true" />
                </a>
                <a
                  href="#"
                    className="text-indigo-200 hover:text-white transition-colors"
                    aria-label="Siga-nos no Instagram"
                >
                    <Instagram size={20} aria-hidden="true" />
                </a>
                <a
                  href="#"
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
