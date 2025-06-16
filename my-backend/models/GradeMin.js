const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class GradeMin extends Model {}

GradeMin.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  grade_min: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  }, {
  sequelize,
  modelName: 'GradeMin',
});

module.exports = GradeMin;
