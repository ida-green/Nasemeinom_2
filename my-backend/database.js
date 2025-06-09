const { Sequelize } = require('sequelize');

// Создание экземпляра Sequelize
const sequelize = new Sequelize('db04', 'root', '', {
  host: 'localhost',
  dialect: 'mariadb', // Указываем dialect как 'mariadb'
  port: 3306, // Порт по умолчанию для MariaDB
  logging: false,
});

// Проверка соединения
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
