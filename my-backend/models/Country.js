// models/Country.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class Country extends Model {}

Country.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  geonameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  name_en: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_ru: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  iso_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    unique: true,
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
    type: DataTypes.INTEGER, // или DataTypes.BIGINT, если ожидается большое значение
    allowNull: true, // Может быть null, если данные отсутствуют
  },
  feature_code: {
    type: DataTypes.STRING, // Укажите размер в зависимости от ваших требований
    allowNull: true, // Может быть null, если данные отсутствуют
  },
}, {
  sequelize,
  modelName: 'Country',
  tableName: 'countries',
  timestamps: false,
});

module.exports = Country;