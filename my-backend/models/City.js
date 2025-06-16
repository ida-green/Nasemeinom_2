// models/City.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class City extends Model {}

City.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  // geonameId из файла allCountries.txt
  geonameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Каждый geonameId уникален для города
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
  // Внешний ключ для связи со страной (для удобства, хотя можно получить через регион)
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  // Внешний ключ для связи с регионом
  region_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Важно: не все города могут быть привязаны к ADM1/ADM2 в Geonames
    references: {
      model: 'regions', // Название таблицы региона
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Если регион удаляется, обнуляем region_id у города
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7), // Опечатка, должно быть DECIMAL
    allowNull: true,
  },
  population: {
    type: DataTypes.INTEGER,
    allowNull: true, // Некоторые города могут не иметь данных о населении
  },
   feature_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  admin1_code: { // Вот он!
    type: DataTypes.STRING,
    allowNull: true, // ADM1 code может отсутствовать
  },
}, {
  sequelize,
  modelName: 'City',
  tableName: 'cities', // Указываем имя таблицы явно
  timestamps: false,
});

module.exports = City;
