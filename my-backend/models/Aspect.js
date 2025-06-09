const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Убедитесь, что путь к базе данных правильный

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
