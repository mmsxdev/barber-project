# Barbearia Project - Frontend

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha a variável `VITE_API_URL` com a URL do seu backend

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Para build de produção:
```bash
npm run build
```

## Segurança

- Nunca compartilhe ou comite o arquivo `.env`
- Use variáveis de ambiente diferentes para desenvolvimento e produção
- Mantenha suas credenciais seguras

## Estrutura do Projeto

- `/src/components`: Componentes React
- `/src/pages`: Páginas da aplicação
- `/src/services`: Serviços e integrações com API
- `/public`: Arquivos estáticos

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
