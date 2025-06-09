const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Импортируйте ваш экземпляр sequelize
const Course = require('./Course'); // Импортируйте модель Course
const Aspect = require('./Aspect'); // Импортируйте модель Aspect

class CourseAspect extends Model {}

CourseAspect.init({
    course_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Course,
            key: 'id'
        },
        allowNull: false, // Добавьте это, если поле обязательно
    },
    aspect_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Aspect,
            key: 'id'
        },
        allowNull: false, // Добавьте это, если поле обязательно
    }
}, {
    sequelize,
    modelName: 'CourseAspect',
    tableName: 'courseaspects',
});

module.exports = CourseAspect;
