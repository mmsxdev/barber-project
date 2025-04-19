import { memo } from 'react';

const products = [
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
    image: "https://placehold.co/300x300/EEE/003366?text=Óleo+Barba",
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
];

const ProductCard = memo(({ product, isDarkMode }) => (
  <div
    className={`${
      isDarkMode
        ? "bg-white/5"
        : "bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm border border-white/60"
    } rounded-xl overflow-hidden shadow-xl transform-gpu hover:-translate-y-1 transition-transform duration-300 group`}
    role="listitem"
  >
    <div className="relative h-60">
      <img
        src={product.image}
        alt={`Imagem do produto ${product.name}`}
        className="w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        width="300"
        height="300"
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
          className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transform-gpu hover:scale-110 transition-transform duration-300"
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
));

ProductCard.displayName = 'ProductCard';

const ProductsSection = memo(({ isDarkMode }) => {
  return (
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
          {products.map((product, index) => (
            <ProductCard key={index} product={product} isDarkMode={isDarkMode} />
          ))}
        </div>
      </div>
    </section>
  );
});

ProductsSection.displayName = 'ProductsSection';

export default ProductsSection; 