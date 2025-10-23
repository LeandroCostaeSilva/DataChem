# Deploy do backend (Express) no Render

Este repositório já inclui um blueprint `render.yaml` que cria um Web Service para o backend (`server/index.js`). Siga os passos abaixo para publicar rapidamente e integrar com o GitHub Pages.

## Pré‑requisitos
- Conta no Render (https://render.com/)
- Repositório GitHub conectado ao Render (Authorize GitHub)
- Sua chave da API Perplexity em mãos

## Passo a passo
1) No Render, clique em New ➜ "Blueprint".
2) Aponte para este repositório (ele detectará o `render.yaml`).
3) Confirme o serviço `datachem-agent` com:
   - Runtime: Node
   - Root Dir: `server`
   - Build Command: `npm ci`
   - Start Command: `node index.js`
4) Defina as variáveis de ambiente:
   - `ANTHROPIC_API_KEY`: cole sua chave do Claude (não commit)
   - `PERPLEXITY_API_KEY`: cole sua chave (se usar interações via Perplexity)
   - `ALLOWED_ORIGINS`: `https://datachem.com.br,https://www.datachem.com.br`
   - `PORT`: `5050` (opcional, já definido)
5) Clique em "Apply" para criar e iniciar o deploy.

Quando terminar, você terá uma URL pública, por exemplo:
```
https://datachem-agent.onrender.com
```
O endpoint de produção do agente será:
```
https://datachem-agent.onrender.com/api/agent/search
```

## Integrar com o frontend (GitHub Pages)
1) No GitHub, abra: Settings ➜ Secrets and variables ➜ Actions ➜ New repository secret.
2) Crie o secret `VITE_AGENT_URL` com o valor da URL completa acima (incluindo `/api/agent/search`).
3) Refaça o deploy do Pages (push vazio ou "Re-run all jobs").

O workflow `pages.yml` já injeta `VITE_AGENT_URL` no build do Vite.

## Teste rápido
- No navegador: abra `https://datachem.com.br` e teste a busca.
- Em caso de erro de CORS, ajuste `ALLOWED_ORIGINS` no serviço do Render para incluir o domínio (ou subdomínio) usado.

## Observações
- Em desenvolvimento local, o backend continua escutando na porta `5050`.
- O arquivo `.env.example` foi atualizado com as variáveis necessárias.