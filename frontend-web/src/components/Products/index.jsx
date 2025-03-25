import { useRef, useState, useEffect } from "react";
import api from "../../services/api";

function ProdutosSection() {
  const nameProductRef = useRef();
  const priceProductRef = useRef();
  const descriptionProductRef = useRef();
  const quantityProductRef = useRef();

  const [produtos, setProdutos] = useState([]);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const loadProdutos = async () => {
    try {
      const response = await api.get("/produtos");
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const parsePrice = (priceString) => {
    if (typeof priceString === "number") return priceString;

    let cleaned = priceString.replace(/[^\d,]/g, "");
    cleaned = cleaned.replace(",", ".");
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para cadastrar um produto.");
      return;
    }

    try {
      await api.post("/produtos", {
        name: nameProductRef.current.value,
        price: parsePrice(priceProductRef.current.value),
        description: descriptionProductRef.current.value,
        quantityInStock: parseInt(quantityProductRef.current.value),
      });
      alert("Produto cadastrado com sucesso");
      loadProdutos();
      nameProductRef.current.value = "";
      priceProductRef.current.value = "";
      descriptionProductRef.current.value = "";
      quantityProductRef.current.value = "";
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await api.delete(`/produtos/${id}`);
        alert("Produto deletado com sucesso");
        loadProdutos();
      } catch (error) {
        console.error("Erro ao deletar produto:", error);
        alert("Erro ao deletar produto");
      }
    }
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    try {
      await api.put(`/produtos/${produtoEditando.id}`, {
        name: nameProductRef.current.value,
        price: parsePrice(priceProductRef.current.value),
        description: descriptionProductRef.current.value,
        quantityInStock: parseInt(quantityProductRef.current.value),
      });
      alert("Produto atualizado com sucesso");
      setProdutoEditando(null);
      loadProdutos();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert("Erro ao atualizar produto");
    }
  };

  const openEditModal = (produto) => {
    setProdutoEditando(produto);
    nameProductRef.current.value = produto.name;
    priceProductRef.current.value = produto.price.toFixed(2).replace(".", ",");
    descriptionProductRef.current.value = produto.description;
    quantityProductRef.current.value = produto.quantityInStock;
  };

  useEffect(() => {
    const priceInput = priceProductRef.current;

    const handlePriceInput = (e) => {
      let value = e.target.value;
      value = value.replace(/[^\d,]/g, "");

      const commaCount = value.split(",").length - 1;
      if (commaCount > 1) {
        value = value.substring(0, value.lastIndexOf(","));
      }

      if (commaCount === 1) {
        const parts = value.split(",");
        if (parts[1].length > 2) {
          value = parts[0] + "," + parts[1].substring(0, 2);
        }
      }

      e.target.value = value;
    };

    if (priceInput) {
      priceInput.addEventListener("input", handlePriceInput);
    }

    return () => {
      if (priceInput) {
        priceInput.removeEventListener("input", handlePriceInput);
      }
    };
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
        Gerenciamento de Produtos
      </h2>

      <form
        onSubmit={produtoEditando ? handleUpdateProduct : handleCreateProduct}
        className="mb-8 bg-white/10 p-6 rounded-lg backdrop-blur-lg border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            ref={nameProductRef}
            placeholder="Nome do produto"
            className="p-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            ref={priceProductRef}
            placeholder="Preço (ex: 50,00)"
            className="p-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            ref={descriptionProductRef}
            placeholder="Descrição"
            className="p-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            ref={quantityProductRef}
            placeholder="Quantidade em estoque"
            min="0"
            className="p-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          {produtoEditando ? "Atualizar Produto" : "Adicionar Produto"}
        </button>
        {produtoEditando && (
          <button
            type="button"
            onClick={() => setProdutoEditando(null)}
            className="mt-4 ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all"
          >
            Cancelar
          </button>
        )}
      </form>

      <div className="bg-white/10 p-6 rounded-lg backdrop-blur-lg border border-white/10">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
          Lista de Produtos
        </h3>
        {produtos.length === 0 ? (
          <p className="text-center py-4">Nenhum produto cadastrado</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.map((produto) => (
              <div
                key={produto.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col"
              >
                <div className="flex-grow">
                  <h4 className="font-bold text-lg mb-2 truncate">
                    {produto.name}
                  </h4>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {produto.description}
                  </p>
                  <p className="text-blue-300 font-medium mb-1">
                    {formatPrice(produto.price)}
                  </p>
                  <p className="text-sm">
                    Estoque:{" "}
                    <span
                      className={
                        produto.quantityInStock > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {produto.quantityInStock}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => openEditModal(produto)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all text-sm flex-grow"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(produto.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all text-sm flex-grow"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProdutosSection;
