#!/bin/sh
# ─────────────────────────────────────────────────────
# Real Domínio — Backup Automático Diário
# Executa todo dia à meia-noite via cron no container
# ─────────────────────────────────────────────────────

BACKUP_DIR="/backups"
DATE=$(date +"%Y-%m-%d_%H-%M")
FILENAME="realdominio_backup_${DATE}.sql"
KEEP_DAYS=30

echo "[$(date)] Iniciando backup automático..."

# Gerar backup SQL completo
pg_dump -h postgres -U realdominio -d realdominio > "${BACKUP_DIR}/${FILENAME}"

if [ $? -eq 0 ]; then
  # Comprimir para economizar espaço
  gzip "${BACKUP_DIR}/${FILENAME}"
  echo "[$(date)] ✅ Backup criado: ${FILENAME}.gz"

  # Remover backups com mais de 30 dias
  find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${KEEP_DAYS} -delete
  echo "[$(date)] 🗑️  Backups antigos removidos (>30 dias)"
else
  echo "[$(date)] ❌ ERRO ao criar backup!"
fi
