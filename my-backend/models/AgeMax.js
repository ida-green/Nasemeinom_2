const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class AgeMax extends Model {}

AgeMax.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  age_max: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  }, {
  sequelize,
  modelName: 'AgeMax',
});

module.exports = AgeMax;
