const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Убедитесь, что путь к базе данных правильный

class Platform extends Model {}

Platform.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'Platform',
  timestamps: false,
});

module.exports = Platform;
