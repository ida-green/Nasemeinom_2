const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class CartCourse extends Model {}
CartCourse.init({
    cartId: {
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
    purchasedPriceDescription: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'CartCourse',
});

// Экспортируем модель
module.exports = CartCourse;
