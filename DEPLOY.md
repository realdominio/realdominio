# Como colocar o Real Domínio na nuvem

Siga estes passos na ordem. Cada passo leva de 2 a 5 minutos.

---

## PASSO 1 — Criar o banco de dados no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Entre com Google ou crie uma conta com e-mail
4. Clique em "New project"
5. Preencha:
   - **Name:** real-dominio
   - **Database Password:** escolha uma senha forte e ANOTE ela
   - **Region:** South America (São Paulo)
6. Clique em "Create new project"
7. Aguarde 2 minutos enquanto cria

**Copiar a URL do banco:**
1. No menu lateral, clique em "Settings" (engrenagem)
2. Clique em "Database"
3. Role até "Connection string"
4. Clique em "URI"
5. Copie a URL completa — ela começa com postgresql://
6. Substitua [YOUR-PASSWORD] pela senha que você escolheu
7. GUARDE essa URL — você vai precisar no Passo 3

---

## PASSO 2 — Subir o código no GitHub

1. Acesse: https://github.com
2. Crie uma conta se não tiver (é grátis)
3. Clique em "New repository" (botão verde ou "+")
4. Preencha:
   - **Repository name:** real-dominio
   - Marque: **Private** (importante — não deixe público)
5. Clique em "Create repository"
6. Na próxima tela, clique em "uploading an existing file"
7. Arraste todos os arquivos da pasta do sistema para a tela
   - Selecione todos os arquivos e pastas (Ctrl+A)
   - Arraste para o navegador
8. Clique em "Commit changes"

---

## PASSO 3 — Criar o servidor no Railway

1. Acesse: https://railway.app
2. Clique em "Login" → "Login with GitHub"
3. Autorize o Railway a acessar seu GitHub
4. Clique em "New Project"
5. Escolha "Deploy from GitHub repo"
6. Selecione o repositório "real-dominio"
7. O Railway vai começar a fazer o build automaticamente

**Configurar as variáveis de ambiente:**
1. Clique no seu projeto
2. Clique em "Variables"
3. Adicione cada uma das variáveis abaixo:

| Variável | Valor |
|----------|-------|
| DATABASE_URL | (a URL do Supabase que você copiou) |
| NEXTAUTH_SECRET | real-dominio-chave-2025-troque-por-algo-aleatorio |
| NEXTAUTH_URL | (Railway vai te dar depois — veja abaixo) |
| NODE_ENV | production |

**Pegar a URL do Railway:**
1. Clique em "Settings"
2. Clique em "Networking"  
3. Clique em "Generate Domain"
4. Copie o endereço gerado (algo como: real-dominio.up.railway.app)
5. Volte em Variables e cole em NEXTAUTH_URL com https:// na frente

---

## PASSO 4 — Criar as tabelas do banco

1. Ainda no Railway, clique no seu serviço
2. Clique em "Settings"
3. Role até "Deploy" 
4. Em "Start Command", coloque:
   ```
   npx prisma migrate deploy && npx prisma db seed && node server.js
   ```
5. Clique em "Save"
6. O Railway vai reiniciar e criar todas as tabelas automaticamente

---

## PASSO 5 — Acessar o sistema

1. Abra o endereço que o Railway gerou no navegador
   Exemplo: https://real-dominio.up.railway.app
2. A tela de login vai aparecer
3. Entre com:
   - **E-mail:** admin@realdominio.com.br
   - **Senha:** Admin@2025
4. TROQUE A SENHA imediatamente!

---

## Custo mensal estimado

| Serviço | Plano | Custo |
|---------|-------|-------|
| Railway | Hobby | ~$5/mês (≈ R$28) |
| Supabase | Free | Grátis |
| **Total** | | **~R$28/mês** |

O Supabase gratuito suporta até 500MB de dados e 50.000 linhas
— suficiente para começar com tranquilidade.

---

## Se der algum erro

Abra o chat com o Claude, descreva o que apareceu na tela
e cole a mensagem de erro. Resolvo em minutos.
