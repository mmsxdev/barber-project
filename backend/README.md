# Barbearia Project - Backend

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis com seus valores:
     - `MONGODB_URL`: URL de conexão do MongoDB Atlas
     - `JWT_SECRET`: Chave secreta para geração de tokens JWT
     - `GOOGLE_API_KEY`: Chave da API do Google
     - `NODE_ENV`: Ambiente de execução (development/production)

4. Execute as migrações do Prisma:
```bash
npx prisma generate
npx prisma db push
```

5. Inicie o servidor:
```bash
npm run start
```

## Segurança

- Nunca compartilhe ou comite o arquivo `.env`
- Mantenha suas credenciais seguras
- Gere um novo JWT_SECRET para cada ambiente
- Use variáveis de ambiente diferentes para desenvolvimento e produção

## Estrutura do Projeto

- `/routes`: Rotas da API
- `/controllers`: Controladores da aplicação
- `/services`: Serviços e lógica de negócios
- `/prisma`: Schema e configurações do banco de dados
- `/uploads`: Arquivos enviados pelos usuários
- `/auth_baileys_sessions`: Sessões do WhatsApp (não versionado) 