
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class FreeSchools extends Model {}

FreeSchools.init({
  id: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  img: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'FreeSchools',
});

module.exports = FreeSchools;
