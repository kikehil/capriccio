module.exports = {
  apps: [
    {
      name: 'capriccio-api',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3081,
      }
    },
    {
      name: 'capriccio-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3080',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3080,
      }
    }
  ]
};
