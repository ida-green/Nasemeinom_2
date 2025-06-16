const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class Like extends Model {}

Like.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  likeable_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  likeable_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User', // Имя модели пользователей
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Like',
});

module.exports = Like;
