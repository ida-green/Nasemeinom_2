const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class Grade extends Model {}

Grade.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  min_grade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_grade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  }, {
  sequelize,
  modelName: 'Grade',
});

module.exports = Grade;
