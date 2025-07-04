// config.js
const developmentConfig = {
  username: "root",
  password: "",
  database: "db04",
  host: "localhost",
  dialect: "mariadb",
  logging: (msg) => {
        // Логируем только ошибки
        if (msg.includes('ERROR')) {
            console.error(msg);
        }
    },
  port: 3306
};

const testConfig = {
  username: "root",
  password: "",
  database: "test_db",
  host: "localhost",
  dialect: "mariadb",
  port: 3306
};

const productionConfig = {
  username: "your_production_username",
  password: "your_production_password",
  database: "your_production_database_name",
  host: "your_production_host",
  dialect: "mariadb",
  port: 3306
};

const blockedSites = [
  "vk.com",
  "vk.cim",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "linkedin.com",
];

// Экспортируем всё как именованные экспорты
export { developmentConfig, testConfig, productionConfig, blockedSites };
