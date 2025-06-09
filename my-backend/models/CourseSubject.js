const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Импортируйте ваш экземпляр sequelize
const Course = require('./Course'); // Импортируйте модель Course
const Subject = require('./Subject'); // Импортируйте модель Subject

class CourseSubject extends Model {}

CourseSubject.init({
    course_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Course, // Здесь вы ссылаетесь на модель Course, не нужно использовать кавычки
            key: 'id'
        },
        allowNull: false, // Добавьте это, если поле обязательно
    },
    subject_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Subject, // Здесь вы ссылаетесь на модель Subject, не нужно использовать кавычки
            key: 'id'
        },
        allowNull: false, // Добавьте это, если поле обязательно
    }
}, {
    sequelize,
    modelName: 'CourseSubject', // Это имя модели, можно оставить в строках
    tableName: 'coursesubjects', // Это имя таблицы в базе данных
});

module.exports = CourseSubject;
