// models/Family.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Gender extends Model {}

Gender.init({
  id: {
    type: DataTypes.SMALLINT,
    primaryKey: true,
    autoIncrement: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
  // Возможно, другие поля, если есть
}, {
  sequelize,
  modelName: 'Gender',
  tableName: 'genders', // Ваше имя таблицы для полов
  timestamps: false,
});

module.exports = Gender;
