#!/usr/bin/env bash
# Restaura o catálogo do UDF (salas, campus, professores, cursos, ofertas)
# no MongoDB Atlas a partir do archive gerado pelo dev-local.
#
# Uso:
#   ./dev-local/restore-atlas.sh "mongodb+srv://usuario:senha@cluster.mongodb.net/rooms-reservation-app?retryWrites=true&w=majority"
#
set -euo pipefail

cd "$(dirname "$0")"

URI="${1:-${MONGO_URI:-}}"

if [ -z "$URI" ]; then
  echo "Uso: $0 \"mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/rooms-reservation-app?retryWrites=true&w=majority\""
  echo "Ou defina a variável de ambiente MONGO_URI."
  exit 1
fi

ARCHIVE="seed-atlas.archive.gz"

if [ ! -f "$ARCHIVE" ]; then
  echo "ERRO: Arquivo $ARCHIVE não encontrado em dev-local."
  exit 1
fi

echo "Iniciando restauração de dados para o MongoDB Atlas..."

if docker ps --format '{{.Names}}' | grep -q "^labtech-dev-mongo-1$"; then
  echo "Usando container labtech-dev-mongo-1 para executar o mongorestore..."
  docker exec -i labtech-dev-mongo-1 mongorestore --uri="$URI" --archive --gzip < "$ARCHIVE"
elif command -v mongorestore >/dev/null 2>&1; then
  echo "Usando mongorestore local..."
  mongorestore --uri="$URI" --archive="$ARCHIVE" --gzip
else
  echo "ERRO: Nem o container labtech-dev-mongo-1 nem o binário mongorestore local estão disponíveis."
  exit 1
fi

echo "✅ Restauração no Atlas concluída com sucesso!"
