import config from '../lib/config/index.js';

const getHealth = (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  });
};

const getApiRoot = (_req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome to ${config.app.name} API`,
    version: config.app.apiVersion,
    documentation: '/api/docs',
  });
};

export { getHealth, getApiRoot };
