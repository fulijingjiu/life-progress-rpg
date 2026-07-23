#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT_DIR/.lprpg-dev.pid"

is_vite_pid() {
  local pid="$1"
  if [[ ! "$pid" =~ ^[0-9]+$ ]]; then
    return 1
  fi
  if ! ps -p "$pid" > /dev/null 2>&1; then
    return 1
  fi
  local cmd
  cmd="$(ps -p "$pid" -o args= 2>/dev/null || true)"
  [[ "$cmd" == *"vite"* || "$cmd" == *"./node_modules/.bin/vite"* || "$cmd" == *"node .*vite"* || "$cmd" == *"npm run dev"* || "$cmd" == *"npm run dev -- --host"* ]]
}

stop_pid() {
  local pid="$1"
  if ! is_vite_pid "$pid"; then
    return 1
  fi

  kill "$pid" >/dev/null 2>&1 || true
  sleep 1
  if ps -p "$pid" > /dev/null 2>&1; then
    kill -9 "$pid" >/dev/null 2>&1 || true
  fi
  return 0
}

stopped=0

if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  if stop_pid "$PID"; then
    echo "Stopped dev server PID $PID"
    stopped=1
  else
    echo "PID file existed but did not belong to current dev server (stale)."
  fi
  rm -f "$PID_FILE"
fi

if command -v pgrep >/dev/null 2>&1; then
  while IFS= read -r pid; do
    if stop_pid "$pid"; then
      echo "Stopped matching process $pid"
      stopped=1
    fi
  done < <(pgrep -f "node .*\.bin/vite|node_modules/.bin/vite|vite --host|npm run dev")
fi

if [[ $stopped -eq 1 ]]; then
  echo "Dev server stopped."
else
  echo "No running dev server found."
fi
