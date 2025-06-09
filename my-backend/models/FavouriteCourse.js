const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class FavouriteCourse extends Model {}
FavouriteCourse.init({
    favouriteId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    purchasedPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'FavouriteCourse',
});

// Экспортируем модель
module.exports = FavouriteCourse;
