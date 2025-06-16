const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class Region extends Model {}

Region.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  // geonameId из файла allCountries.txt
  geonameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Каждый geonameId уникален для региона
  },
  // Английское или ASCII название
  name_en: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Русское название
  name_ru: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Внешний ключ для связи со страной
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries', // Название таблицы страны
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  // Код административного деления 1-го уровня (из поля 'admin1 code' в allCountries.txt)
  // Это уникально в рамках страны. Например, для России это будет '01' для Адыгеи.
  admin1_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  population: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  feature_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Region',
  tableName: 'regions', // Указываем имя таблицы явно
  timestamps: false,
  indexes: [
    // Комбинированный уникальный индекс: пара (country_id, admin1_code) должна быть уникальной
    {
      unique: true,
      fields: ['country_id', 'admin1_code'],
    },
  ],
});

module.exports = Region;