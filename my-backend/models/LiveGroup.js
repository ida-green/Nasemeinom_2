const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class LiveGroup extends Model {}

LiveGroup.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  }, 
  places: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'LiveGroup',
});

module.exports = LiveGroup;
