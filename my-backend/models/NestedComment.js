const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class NestedComment extends Model {}

NestedComment.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
  }, {
  sequelize,
  modelName: 'NestedComment',
});

module.exports = NestedComment;
