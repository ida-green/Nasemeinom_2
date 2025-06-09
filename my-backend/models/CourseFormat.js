const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Импортируйте ваш экземпляр sequelize
const Course = require('./Course'); // Импортируйте модель Course
const Aspect = require('./Aspect'); // Импортируйте модель Aspect

class CourseFormat extends Model {}

CourseFormat.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false, // Добавьте это, если поле обязательно
    },
    format: {
        type: DataTypes.STRING,
        allowNull: false, // Добавьте это, если поле обязательно
    }
}, {
    sequelize,
    modelName: 'CourseFormat'
});

module.exports = CourseFormat;
