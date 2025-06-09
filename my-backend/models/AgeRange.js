const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Убедитесь, что путь к базе данных правильный

class AgeRange extends Model {}

AgeRange.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  min_age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  }, {
  sequelize,
  modelName: 'AgeRange',
});

module.exports = AgeRange;
