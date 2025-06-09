const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Убедитесь, что путь к базе данных правильный

class GradeMax extends Model {}

GradeMax.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  grade_max: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  }, {
  sequelize,
  modelName: 'GradeMax',
});

module.exports = GradeMax;
