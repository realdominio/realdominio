# Real Domínio — Centro de Inteligência Operacional

Sistema interno de gestão operacional para escritório de contabilidade.

---

## Requisitos mínimos do servidor

- Windows 10/11, Ubuntu 20+ ou macOS 12+
- 4 GB de RAM (recomendado: 8 GB)
- 20 GB de espaço em disco
- Conexão com a internet (apenas para instalação)

---

## Instalação — passo a passo

### 1. Instalar o Docker Desktop

Acesse https://www.docker.com/products/docker-desktop e baixe para o seu sistema.

Após instalar, abra o Docker Desktop e aguarde inicializar (ícone de baleia na barra).

### 2. Baixar o projeto

Coloque a pasta `real-dominio` em um local seguro do servidor, por exemplo:
- Windows: `C:\Sistemas\real-dominio`
- Linux/Mac: `/opt/real-dominio`

### 3. Configurar o ambiente

Na pasta do projeto, copie o arquivo de configuração:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / Mac
cp .env.example .env
```

Abra o arquivo `.env` com o Bloco de Notas e altere:

```
DB_PASSWORD=ESCOLHA_UMA_SENHA_FORTE_AQUI
NEXTAUTH_SECRET=COLOQUE_QUALQUER_TEXTO_LONGO_ALEATORIO_AQUI
NEXTAUTH_URL=http://IP_DO_SERVIDOR:3000
```

> **Dica**: Para o `NEXTAUTH_URL`, coloque o IP da máquina onde o sistema vai rodar.
> Se for acessado só localmente, deixe `http://localhost:3000`.

### 4. Subir o sistema

Abra o terminal (ou PowerShell) na pasta do projeto e execute:

```bash
docker compose up -d
```

Aguarde o download das imagens (primeira vez pode demorar alguns minutos).

### 5. Criar o banco de dados

```bash
docker compose exec app npm run db:deploy
docker compose exec app npm run db:seed
```

Isso cria todas as tabelas e o usuário administrador inicial.

### 6. Acessar o sistema

Abra o navegador e acesse: **http://localhost:3000**

**Primeiro acesso:**
- E-mail: `admin@realdominio.com.br`
- Senha: `Admin@2025`

> ⚠️ **Troque a senha do admin imediatamente após o primeiro acesso!**

---

## Backup dos dados

### Backup automático

O sistema faz backup automático **todo dia à meia-noite** automaticamente.
Os arquivos ficam na pasta `backups/` dentro do projeto.
Backups são mantidos por **30 dias**.

### Backup manual (recomendado 1x por semana)

Dentro do sistema, acesse **Backup** no menu lateral e clique em **Baixar JSON** ou **Baixar Excel**.

Guarde o arquivo em:
- HD externo
- Pen drive
- Google Drive / OneDrive

### Restaurar a partir de um backup

Em caso de perda total, um desenvolvedor pode restaurar o banco usando:

```bash
# Restaurar a partir de arquivo SQL automático
gunzip -c backups/realdominio_backup_YYYY-MM-DD_HH-MM.sql.gz | \
  docker compose exec -T postgres psql -U realdominio -d realdominio
```

---

## Comandos úteis do dia a dia

```bash
# Verificar se o sistema está rodando
docker compose ps

# Ver logs do sistema (útil se algo não funcionar)
docker compose logs app --tail=50

# Reiniciar após atualização
docker compose restart app

# Parar o sistema (não perde dados)
docker compose stop

# Ligar o sistema novamente
docker compose start
```

---

## Atualizar o sistema

Quando receber uma nova versão, dentro da pasta do projeto:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose exec app npm run db:deploy
```

---

## Portas utilizadas

| Serviço | Porta |
|---------|-------|
| Sistema (web) | 3000 |
| Banco de dados | 5432 |

Se outra aplicação já usar essas portas, altere no `docker-compose.yml`.

---

## Usuários e perfis

| Perfil | O que pode fazer |
|--------|-----------------|
| Diretoria | Tudo |
| Coordenador | Ver tudo, editar operacional |
| Líder | Editar seu setor |
| Operador | Editar sua carteira |
| Consulta | Somente visualizar |

---

## Suporte

Em caso de problemas, verifique os logs:

```bash
docker compose logs --tail=100
```

E entre em contato com o desenvolvedor responsável.

---

*Real Domínio — Centro de Inteligência Operacional*
*Versão 1.0 — Fase 1*
  
