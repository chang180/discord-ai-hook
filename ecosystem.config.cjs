module.exports = {
  apps: [
    {
      name: "discord-ai-hook",
      script: "dist/index.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production",
        ENABLE_TEST_UI: "false",
      },
    },
  ],
};
