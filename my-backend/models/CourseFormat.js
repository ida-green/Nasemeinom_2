const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize

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
