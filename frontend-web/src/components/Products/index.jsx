import { useRef, useState, useEffect } from "react";
import api from "../../services/api"; // Importe o axios configurado

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
        price: parseFloat(priceProductRef.current.value),
        description: descriptionProductRef.current.value,
        quantityInStock: parseInt(quantityProductRef.current.value),
      });
      alert("Produto cadastrado com sucesso");
      loadProdutos();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto");
    }
  };

  // Função para deletar um produto
  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/produtos/${id}`);
      alert("Produto deletado com sucesso");
      loadProdutos(); // Recarrega a lista de produtos
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto");
    }
  };

  // Função para atualizar um produto
  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    try {
      await api.put(`/produtos/${produtoEditando.id}`, {
        name: nameProductRef.current.value,
        price: parseFloat(priceProductRef.current.value),
        description: descriptionProductRef.current.value,
        quantityInStock: parseInt(quantityProductRef.current.value), // Corrigido para quantityInStock
      });
      alert("Produto atualizado com sucesso");
      setProdutoEditando(null); // Fecha o modal de edição
      loadProdutos(); // Recarrega a lista de produtos
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert("Erro ao atualizar produto");
    }
  };

  // Função para abrir o modal de edição
  const openEditModal = (produto) => {
    setProdutoEditando(produto);
    nameProductRef.current.value = produto.name;
    priceProductRef.current.value = produto.price;
    descriptionProductRef.current.value = produto.description;
    quantityProductRef.current.value = produto.quantityInStock; // Corrigido para quantityInStock
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
        Gerenciamento de Produtos
      </h2>

      {/* Formulário para adicionar/editar produto */}
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
            placeholder="Preço"
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

      {/* Lista de produtos */}
      <div className="bg-white/10 p-6 rounded-lg backdrop-blur-lg border border-white/10">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
          Lista de Produtos
        </h3>
        <ul className="space-y-4">
          {produtos.map((produto) => (
            <li
              key={produto.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{produto.name}</p>
                  <p>{produto.description}</p>
                  <p>Preço: R$ {produto.price.toFixed(2)}</p>
                  <p>Quantidade em estoque: {produto.quantityInStock}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(produto)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(produto.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProdutosSection;
