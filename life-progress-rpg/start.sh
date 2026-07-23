#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT_DIR/.lprpg-dev.pid"
LOG_FILE="$ROOT_DIR/logs/dev-server.log"
VITE_BIN="$ROOT_DIR/node_modules/.bin/vite"
HOST="${1:-0.0.0.0}"
PORT="${2:-4173}"
WAIT_SECONDS=12
READY_HOLD_SECONDS=3

mkdir -p "$ROOT_DIR/logs"

is_running_vite_pid() {
  local pid="$1"
  if [[ ! "$pid" =~ ^[0-9]+$ ]]; then
    return 1
  fi
  if ! ps -p "$pid" > /dev/null 2>&1; then
    return 1
  fi
  local cmd
  cmd="$(ps -p "$pid" -o args= 2>/dev/null || true)"
  [[ "$cmd" == *"vite"* || "$cmd" == *"./node_modules/.bin/vite"* || "$cmd" == *"node .*vite"* ]]
}

is_port_open() {
  curl -sS --max-time 1 -I "http://127.0.0.1:${PORT}" >/dev/null 2>&1
}

has_emfile() {
  if [[ ! -f "$LOG_FILE" ]]; then
    return 1
  fi
  rg -q "EMFILE: too many open files" "$LOG_FILE"
}

if [[ -f "$PID_FILE" ]]; then
  if is_running_vite_pid "$(cat "$PID_FILE")"; then
    echo "Dev server already running with PID $(cat "$PID_FILE")"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

if is_port_open; then
  echo "Port ${PORT} is already used. Stop existing service first or set a different port."
  exit 1
fi

cd "$ROOT_DIR"
ulimit -n 65535 >/dev/null 2>&1 || true
export CHOKIDAR_USEPOLLING=1
export CHOKIDAR_INTERVAL=300
export WATCHPACK_POLLING=1
export VITE_USE_POLLING=1

setsid "$VITE_BIN" --host "$HOST" --port "$PORT" --strictPort >> "$LOG_FILE" 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"

echo "Starting dev server (PID: $PID)..."

start_at=$SECONDS
ready_at=-1
while true; do
  if ! is_running_vite_pid "$PID"; then
    echo "Failed to start: process $PID exited."
    echo "Check log: $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
  fi

  if has_emfile; then
    echo "Failed to start: file watcher limit (EMFILE) hit."
    echo "Check log: $LOG_FILE"
    kill "$PID" >/dev/null 2>&1 || true
    rm -f "$PID_FILE"
    exit 1
  fi

  if is_port_open; then
    if [[ $ready_at -lt 0 ]]; then
      ready_at=$SECONDS
    fi
    if (( SECONDS - ready_at >= READY_HOLD_SECONDS )); then
      break
    fi
  else
    ready_at=-1
  fi

  if (( SECONDS - start_at >= WAIT_SECONDS )); then
    echo "Failed to start dev server within ${WAIT_SECONDS}s"
    echo "Check log: $LOG_FILE"
    kill "$PID" >/dev/null 2>&1 || true
    rm -f "$PID_FILE"
    exit 1
  fi
  sleep 1
done

echo "Dev server started in background."
echo "Listening on:"
echo " - Local: http://127.0.0.1:${PORT}"
if [[ "$HOST" != "127.0.0.1" && "$HOST" != "localhost" ]]; then
  echo " - Network: http://$HOST:${PORT}"
fi
echo "Log: $LOG_FILE"
echo "Stop with: ./stop.sh"
