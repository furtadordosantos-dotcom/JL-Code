# Publicação do JL Code no Cloudflare

## Arquitetura

- **Cloudflare Pages** entrega somente o conteúdo produzido em `dist/`.
- **Pages Functions** em `functions/api/[[path]].js` mantém as URLs atuais `/api/*`.
- **D1** armazena usuários, verificações, pagamentos, planos, acessos, apostilas e histórico da IA.
- **R2** armazena os PDFs com as chaves `apostilas/html-fundamentos.pdf`, `apostilas/css-interface.pdf` e `apostilas/javascript-pratica.pdf`. O bucket não deve ser público.

## Primeira configuração

1. Instale dependências: `npm install`.
2. Autentique o Wrangler: `npx wrangler login`.
3. Crie o banco: `npx wrangler d1 create jl-code-production`.
4. Copie o `database_id` retornado para `wrangler.jsonc`.
5. Crie o bucket: `npx wrangler r2 bucket create jl-code-apostilas`.
6. Aplique a estrutura: `npx wrangler d1 migrations apply jl-code-production --remote`.
7. Envie os três PDFs, usando as chaves descritas acima. Eles não devem ir para `dist/` nem receber domínio público.

## Secrets do Pages

No painel Cloudflare, em **Workers & Pages > JL Code > Settings > Variables and Secrets**, crie como valores criptografados:

- `JWT_SECRET`: valor longo, aleatório e exclusivo;
- `BREVO_API_KEY`;
- `EMAIL_FROM`: remetente validado no Brevo;
- `APP_URL`: URL HTTPS final do Pages;
- `INFINITEPAY_HANDLE`: `juliano-lucas-2024`;
- `INFINITEPAY_API_KEY`: somente se a InfinitePay fornecer uma credencial privada para a conta.

Não coloque nenhum desses valores em HTML, `script.js`, `wrangler.jsonc` ou Git.

## Deploy

Use `npm run build` como comando de build e `dist` como diretório de saída no Pages. O Pages reconhecerá a pasta `functions/` automaticamente. Para testar localmente: `npm run pages:dev`.

## Dados atuais

O banco local `data/jlcode.db` não é publicado. Para migrar usuários existentes, exporte seu SQLite para SQL e importe no D1 antes do lançamento. Faça backup antes da importação.

## Pagamento — InfinitePay

O site cria o checkout no backend em `POST /api/payments/infinitepay/checkout`. Os preços oficiais ficam fixos no servidor: Beta `12990` e Pro `19990` centavos. O cliente é direcionado ao checkout da InfinitePay e preenche Pix ou cartão apenas lá.

Configure o webhook da InfinitePay para:

`https://jlcode.pages.dev/api/payments/infinitepay/webhook`

O webhook e a página de retorno não liberam o plano por conta própria. Ambos consultam `payment_check` na InfinitePay, verificam `order_nsu`, valor e transação e só então ativam o plano por 15 dias. O endpoint é idempotente: uma confirmação repetida não duplica a compra nem os acessos.

O Checkout Integrado público atual da InfinitePay usa a InfiniteTag no payload. Caso a InfinitePay habilite uma chave privada para a conta, cadastre-a apenas como secret no Pages; nunca a exponha no frontend.
