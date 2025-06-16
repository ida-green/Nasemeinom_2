const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class AgeFilter extends Model {}

AgeFilter.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  age_filter: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  }, {
  sequelize,
  modelName: 'AgeFilter',
});

module.exports = AgeFilter;
