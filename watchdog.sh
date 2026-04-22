#!/bin/bash
# Watchdog script for SUGGESTION server
# Restarts the Express server if it dies

cd /home/z/my-project
export PORT=3000
export NODE_OPTIONS="--max-old-space-size=256"

while true; do
  echo "[$(date '+%H:%M:%S')] Starting server..."
  node server.js
  EXIT_CODE=$?
  echo "[$(date '+%H:%M:%S')] Server exited with code $EXIT_CODE"
  echo "[$(date '+%H:%M:%S')] Restarting in 2 seconds..."
  sleep 2
done
