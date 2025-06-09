const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Убедитесь, что путь к базе данных правильный


class Course extends Model {}

Course.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  format_id: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  excerpt: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  single_price: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  record_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  record_available_period: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  img: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoYoutubeUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  age_min: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  age_max: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  grade_min: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  grade_max: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lessons_quantity: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  provider_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pricehistory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Course',
});

module.exports = Course;
