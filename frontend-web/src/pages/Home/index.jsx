import { useEffect, useState } from "react";
import {
  Scissors,
  MapPin,
  Smartphone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-lg ${
          scrolled ? "bg-white/10 shadow-lg" : "bg-transparent"
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
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-slate-300 hover:text-blue-400 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-blue-400"
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 bg-white/10 backdrop-blur-lg rounded-lg p-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
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
        className="pt-24 pb-12 bg-gradient-to-r from-slate-800 to-slate-900"
      >
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in-up">
            Bem-vindo à Barbearia Style
          </h1>
          <p className="text-xl mb-8 text-slate-300">
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
      <section id="servicos" className="py-20 bg-slate-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["Tratamento Capilar", "Barba", "Cabelo"].map((service) => (
              <div
                key={service}
                className="p-6 bg-white/5 backdrop-blur-lg rounded-xl hover:shadow-xl transition-all"
              >
                <Scissors className="mb-4 text-blue-400" size={32} />
                <h3 className="text-xl font-semibold mb-2">{service}</h3>
                <p className="text-slate-300">
                  Descrição breve do serviço oferecido pela barbearia.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe Section */}
      <section id="equipe" className="py-20 bg-slate-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Nossa Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["João Silva", "Pedro Almeida", "Carlos Mendes"].map((member) => (
              <div
                key={member}
                className="text-center bg-white/5 backdrop-blur-lg rounded-xl p-6 hover:shadow-xl transition-all"
              >
                <div className="w-48 h-48 mx-auto bg-gray-200 rounded-full mb-4"></div>
                <h3 className="text-xl font-semibold">{member}</h3>
                <p className="text-slate-300">
                  Especialista em cortes clássicos
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos Section */}
      <section id="produtos" className="py-20 bg-slate-800">
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
                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden hover:shadow-xl transition-all"
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
                  <p className="text-slate-300 text-sm mb-4">
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
      <section id="localizacao" className="py-20 bg-slate-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossa Localização
          </h2>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden">
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
      <section id="contato" className="py-20 bg-slate-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Entre em Contato
          </h2>
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl mb-8">
              <h3 className="text-2xl font-semibold mb-4">
                Agendamento via WhatsApp
              </h3>
              <p className="mb-6 text-slate-300">
                Clique no botão abaixo para agendar diretamente pelo WhatsApp
              </p>
              <a
                href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20agendar%20um%20horário"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all inline-flex items-center"
                target="_blank"
                rel="noreferrer"
              >
                <Smartphone className="mr-2" />
                Agendar via WhatsApp
              </a>
            </div>

            <div className="mt-12 bg-white/5 backdrop-blur-lg p-8 rounded-xl">
              <h3 className="text-2xl font-semibold mb-4">Faça uma visita</h3>
              <div className="space-y-2 text-slate-300">
                <p className="flex items-center justify-center">
                  <Smartphone className="mr-2" /> (11) 99999-9999
                </p>
                <p className="flex items-center justify-center">
                  <MapPin className="mr-2" /> Rua Principal, 123 - Centro
                </p>
                <p>Horário de funcionamento: Seg-Sáb 09:00 - 19:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Barbearia Style</h3>
              <p className="text-slate-400">
                Desde 2010 oferecendo os melhores serviços de barbearia
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center">
                  <MapPin className="mr-2" size={18} />
                  Rua Principal, 123
                </li>
                <li className="flex items-center">
                  <Smartphone className="mr-2" size={18} />
                  (11) 99999-9999
                </li>
                <li className="flex items-center">
                  <Mail className="mr-2" size={18} />
                  contato@barbearia.com
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Redes Sociais</h4>
              <ul className="space-y-2 text-slate-400">
                <a href="facebook.com" className="flex items-center">
                  <Facebook className="mr-2" size={18} />
                  Facebook
                </a>
                <a href="twitter.com" className="flex items-center">
                  <Twitter className="mr-2" size={18} />
                  Twitter
                </a>
                <a href="instagram.com" className="flex items-center">
                  <Instagram className="mr-2" size={18} />
                  Instagram
                </a>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2024 Barbearia Style. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
