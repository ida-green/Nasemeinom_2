const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

class Children extends Model {}

Children.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: { // Ссылка на родителя
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birth_date: {
    type: DataTypes.DATE, 
    allowNull: true,
  },
  education_form_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Добавьте другие поля, если необходимо
}, {
  sequelize,
  modelName: 'Children',
  tableName: 'children', // Убедитесь, что имя таблицы соответствует вашей БД
  timestamps: false,
});

module.exports = Children;

