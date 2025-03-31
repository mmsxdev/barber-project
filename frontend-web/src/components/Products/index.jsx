import { useRef, useState, useEffect } from "react";
import api from "../../services/api";
import { useTheme } from "../../contexts/ThemeContext";

function ProdutosSection() {
  const nameProductRef = useRef();
  const priceProductRef = useRef();
  const descriptionProductRef = useRef();
  const quantityProductRef = useRef();
  const { isDarkMode } = useTheme();

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
    <div
      className={`p-6 min-h-screen ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}
    >
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
        Gerenciamento de Produtos
      </h2>

      <div
        className={`${
          isDarkMode
            ? "bg-white/10 border-white/10"
            : "bg-white border-gray-200"
        } p-6 rounded-lg backdrop-blur-lg border shadow-lg`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
            Lista de Produtos
          </h3>

          <div
            className={`mt-2 md:mt-0 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Total:{" "}
            <span className="font-bold text-blue-500">{produtos.length}</span>{" "}
            produtos
          </div>
        </div>

        {produtos.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-12 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-lg">Nenhum produto cadastrado</p>
            <p className="text-sm mt-2">
              Adicione produtos usando o formulário acima
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <div
                key={produto.id}
                className={`rounded-xl overflow-hidden shadow-lg border ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-700"
                    : "bg-white border-gray-200"
                } hover:shadow-xl transition-all`}
              >
                <div
                  className={`p-4 ${
                    isDarkMode
                      ? "border-b border-gray-700"
                      : "border-b border-gray-100"
                  }`}
                >
                  <h4 className="font-bold text-lg truncate">{produto.name}</h4>
                  <p
                    className={`text-sm mt-2 line-clamp-2 h-10 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {produto.description}
                  </p>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Preço
                    </div>
                    <div className="text-lg font-bold text-blue-500">
                      {formatPrice(produto.price)}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Estoque
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`text-2xl font-bold mr-2 ${
                          produto.quantityInStock > 19
                            ? "text-green-500"
                            : produto.quantityInStock > 10
                            ? "text-yellow-500"
                            : produto.quantityInStock > 0
                            ? "text-orange-500"
                            : "text-red-500"
                        }`}
                      >
                        {produto.quantityInStock}
                      </div>
                      <div
                        className={`text-xs py-1 px-2 rounded-full ${
                          produto.quantityInStock > 19
                            ? isDarkMode
                              ? "bg-green-900/40 text-green-400"
                              : "bg-green-100 text-green-700"
                            : produto.quantityInStock > 10
                            ? isDarkMode
                              ? "bg-orange-900/40 text-yellow-400"
                              : "bg-orange-100 text-yellow-600"
                            : produto.quantityInStock > 0
                            ? isDarkMode
                              ? "bg-yellow-900/40 text-orange-400"
                              : "bg-yellow-100 text-orange-700"
                            : isDarkMode
                            ? "bg-red-900/40 text-red-400"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {produto.quantityInStock > 19
                          ? "Em estoque"
                          : produto.quantityInStock > 10
                          ? "Estoque médio"
                          : produto.quantityInStock > 0
                          ? "Estoque baixo"
                          : "Sem estoque"}
                      </div>
                    </div>

                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          produto.quantityInStock > 19
                            ? "bg-green-500"
                            : produto.quantityInStock > 10
                            ? "bg-yellow-500"
                            : produto.quantityInStock > 0
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            produto.quantityInStock * 5,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`flex gap-2 p-4 ${
                    isDarkMode ? "bg-gray-900/50" : "bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => openEditModal(produto)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all text-sm flex-grow flex items-center justify-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(produto.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all text-sm flex-grow flex items-center justify-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={produtoEditando ? handleUpdateProduct : handleCreateProduct}
        className={`mt-8 mb-8 ${
          isDarkMode
            ? "bg-white/10 border-white/10"
            : "bg-white border-gray-200"
        } p-6 rounded-lg backdrop-blur-lg border shadow-lg`}
      >
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent mb-4">
          Adicionar Produto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            ref={nameProductRef}
            placeholder="Nome do produto"
            className={`p-2 rounded border ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          <input
            type="text"
            ref={priceProductRef}
            placeholder="Preço (ex: 50,00)"
            className={`p-2 rounded border ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          <input
            type="text"
            ref={descriptionProductRef}
            placeholder="Descrição"
            className={`p-2 rounded border ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          <input
            type="number"
            ref={quantityProductRef}
            placeholder="Quantidade em estoque"
            min="0"
            className={`p-2 rounded border ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
    </div>
  );
}

export default ProdutosSection;
