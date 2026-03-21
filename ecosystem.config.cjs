const { getEnvironment } = require('./src/server/src/lib/environment');
const { apps as client } = require('./src/client/ecosystem.config.cjs');
const { apps as server } = require('./src/server/ecosystem.config.cjs');

const environment = getEnvironment();

module.exports = {
  apps: [
    ...client,
    ...server,
  ],
  deploy: {
    production: {
      repo: 'git@github.com:evergosu/fource.git',
      'post-setup': 'pnpm install --production',
      'post-deploy': 'pnpm launch:daemon',
      path: '/home/ubuntu/fource',
      host: [environment.host.ip],
      ref: 'origin/master',
      user: 'ubuntu',
    },
  },
};
