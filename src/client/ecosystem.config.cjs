/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const logDirectory = path.join(os.homedir(), 'logs/fource');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

module.exports = {
  apps: [
    {
      error_file: path.join(logDirectory, 'client.err.log'),
      out_file: path.join(logDirectory, 'client.out.log'),
      env: {
        NODE_ENV: 'production',
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      exp_backoff_restart_delay: 500,
      max_memory_restart: '1G',
      args: 'start:production',
      exec_mode: 'cluster',
      namespace: 'fource',
      interpreter: 'none',
      autorestart: true,
      min_uptime: 5000,
      max_restarts: 10,
      wait_ready: true,
      name: 'client',
      script: 'pnpm',
      instances: -1,
    },
  ],
};
