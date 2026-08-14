#!/usr/bin/env bash
# ============================================================
#  Personal OS — подключение Telegram к Hermes_b (hermes-core)
#
#  Запускать ОТ ROOT на машине с hermes_b:
#    sudo TELEGRAM_BOT_TOKEN="<токен от @BotFather>" bash setup-hermes-b-telegram.sh
#
#  Что делает:
#    1. Чинит мост hermes-core (кладёт обёртку 'hermes' в /usr/local/bin —
#       мост ищет бинарь по имени, а PATH у него урезанный systemd-овский)
#    2. Прописывает telegram-платформу в ~/.hermes/.env и config.yaml hermes_b
#       (+ fallback_ips — обход DPI-блокировки Telegram провайдером)
#    3. Создаёт и запускает системный юнит hermes-b-gateway.service
#
#  Безопасно повторять: идемпотентно.
# ============================================================
set -euo pipefail

HERMES_B_HOME="/home/hermes_b"
HERMES_BIN="$HERMES_B_HOME/.hermes/hermes-agent/hermes"
VENV_PY="$HERMES_B_HOME/.hermes/hermes-agent/venv/bin/python"
ENV_FILE="$HERMES_B_HOME/.hermes/.env"
OWNER_ID="${TG_OWNER_ID:-136098453}"
FALLBACK_IPS="149.154.167.220,149.154.166.110"
BRIDGE_SECRET="h7k9m2p4x1q8w3r6"   # уже публичен в config.js репозитория

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
[ -n "$TOKEN" ] || { echo "ОШИБКА: задай TELEGRAM_BOT_TOKEN (токен от @BotFather)"; exit 1; }
[ -e "$HERMES_BIN" ] || { echo "ОШИБКА: не найден $HERMES_BIN"; exit 1; }

echo "==> 1/4 Чиню мост hermes-core (обёртка 'hermes' в /usr/local/bin)"
cat > /usr/local/bin/hermes <<'EOF'
#!/bin/sh
exec /home/hermes_b/.hermes/hermes-agent/venv/bin/python /home/hermes_b/.hermes/hermes-agent/hermes "$@"
EOF
chmod 755 /usr/local/bin/hermes

echo "==> Проверка моста (POST ping)"
REPLY=$(curl -s -m 60 -X POST -H 'Content-Type: application/json' \
  -d '{"agent":"hermes-core","command":"ping","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' \
  "http://127.0.0.1:38765/hermes-core/$BRIDGE_SECRET/command" || true)
echo "    Мост ответил: $REPLY"

echo "==> 2/4 Прописываю telegram в ~/.hermes/.env hermes_b"
touch "$ENV_FILE"
chown hermes_b:hermes_b "$ENV_FILE"
chmod 600 "$ENV_FILE"
sed -i '/^TELEGRAM_BOT_TOKEN=/d; /^TELEGRAM_ALLOWED_USERS=/d; /^TELEGRAM_HOME_CHANNEL=/d' "$ENV_FILE"
{
  echo ""
  echo "# TELEGRAM INTEGRATION (добавлено setup-hermes-b-telegram.sh)"
  echo "TELEGRAM_BOT_TOKEN=$TOKEN"
  echo "TELEGRAM_ALLOWED_USERS=$OWNER_ID"
  echo "TELEGRAM_HOME_CHANNEL=$OWNER_ID"
} >> "$ENV_FILE"

echo "==> 3/4 Прописываю platforms.telegram в config.yaml hermes_b"
run_as_b() { sudo -u hermes_b "$VENV_PY" "$HERMES_BIN" "$@"; }
run_as_b config set platforms.telegram.enabled true
run_as_b config set platforms.telegram.polling true
run_as_b config set platforms.telegram.extra.fallback_ips "$FALLBACK_IPS"

echo "==> 4/4 Создаю и запускаю юнит hermes-b-gateway.service"
cat > /etc/systemd/system/hermes-b-gateway.service <<EOF
[Unit]
Description=Hermes B Telegram gateway
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=hermes_b
Environment=PATH=/snap/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=$VENV_PY -m hermes_cli.main gateway run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now hermes-b-gateway

echo "==> Проверка"
sleep 4
systemctl --no-pager -l --no-legend status hermes-b-gateway 2>/dev/null | head -6 || true
echo ""
echo "ГОТОВО. Напиши боту hermes_b в Telegram (long polling пойдёт через fallback IP)."
