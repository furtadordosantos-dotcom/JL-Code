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
- `RESEND_API_KEY`;
- `EMAIL_FROM`: remetente de um domínio verificado no Resend;
- `OPENAI_API_KEY` (quando a IA for ativada);
- `OPENAI_MODEL`;
- `APP_URL`: URL HTTPS final do Pages;
- `PIX_KEY`;
- `DEV_DEMO_MODE=false`.

Não coloque nenhum desses valores em HTML, `script.js`, `wrangler.jsonc` ou Git.

## Deploy

Use `npm run build` como comando de build e `dist` como diretório de saída no Pages. O Pages reconhecerá a pasta `functions/` automaticamente. Para testar localmente: `npm run pages:dev`.

## Dados atuais

O banco local `data/jlcode.db` não é publicado. Para migrar usuários existentes, exporte seu SQLite para SQL e importe no D1 antes do lançamento. Faça backup antes da importação.

## Pagamento

`confirm-demo` existe apenas para desenvolvimento e fica desligado quando `DEV_DEMO_MODE=false`. Para pagamentos reais, conecte o gateway escolhido a uma Function de webhook que valide a assinatura do provedor antes de confirmar o pagamento.
