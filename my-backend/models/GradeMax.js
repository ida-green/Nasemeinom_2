const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

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
