#!/bin/bash
# Start Next.js production server with auto-restart
cd /home/z/my-project

export NODE_OPTIONS="--max-old-space-size=256"
export PORT=3000

while true; do
  echo "[$(date)] Starting Next.js server..."
  node -e "
    process.on('SIGTERM', () => { console.log('SIGTERM received'); process.exit(0); });
    process.on('SIGINT', () => { console.log('SIGINT received'); process.exit(0); });
    process.on('exit', (code) => { console.log('Process exiting with code:', code); });
    process.on('uncaughtException', (err) => { console.error('Uncaught:', err.message); });
    
    const { createServer } = require('http');
    const { parse } = require('url');
    const next = require('next');
    
    const app = next({ dev: false, quiet: true });
    const handle = app.getRequestHandler();
    
    app.prepare().then(() => {
      const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      }).listen(3000, () => {
        console.log('> Ready on http://localhost:3000');
      });
      server.on('error', (err) => { console.error('Server error:', err); });
    }).catch((err) => {
      console.error('Prepare error:', err);
      process.exit(1);
    });
  "
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE"
  if [ $EXIT_CODE -ne 0 ]; then
    echo "[$(date)] Restarting in 3 seconds..."
    sleep 3
  else
    echo "[$(date)] Clean exit, not restarting"
    break
  fi
done
