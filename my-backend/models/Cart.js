const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Cart extends Model {}
Cart.init({
  id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
  },
  userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
  },
  createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
  },
  updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Cart',
});

// Экспортируем модель
module.exports = Cart;
