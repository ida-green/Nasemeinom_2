const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); 

class Subject extends Model {}

Subject.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Subject',
  tableName: 'subjects'
});

module.exports = Subject;
