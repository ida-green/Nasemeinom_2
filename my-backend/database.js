const { Sequelize, DataTypes } = require('sequelize');
const { developmentConfig, testConfig, productionConfig } = require('./config/config.js');

let config;
switch (process.env.NODE_ENV) {
    case 'test':
        config = testConfig;
        break;
    case 'production':
        config = productionConfig;
        break;
    default:
        config = developmentConfig;
}

const sequelize = new Sequelize(config);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Соединение с базой данных успешно установлено.');
  } catch (error) {
    console.error('Не удалось подключиться к базе данных:', error);
  }
};

testConnection();

module.exports = sequelize;
