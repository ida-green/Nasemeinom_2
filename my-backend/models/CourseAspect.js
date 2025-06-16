const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js'); // Импортируйте ваш экземпляр sequelize
const Course = require('./Course.js'); // Импортируйте модель Course
const Aspect = require('./Aspect.js'); // Импортируйте модель Aspect

class CourseAspect extends Model {}

CourseAspect.init({
    course_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Course,
            key: 'id'
        },
        allowNull: false,
    },
    aspect_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Aspect,
            key: 'id'
        },
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'CourseAspect',
    tableName: 'courseaspects',
});

module.exports = CourseAspect;
