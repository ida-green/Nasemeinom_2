const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class Aspect extends Model {}

Aspect.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  aspect: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  }, {
  sequelize,
  modelName: 'Aspect',
  tableName: 'aspects'
});

module.exports = Aspect;
