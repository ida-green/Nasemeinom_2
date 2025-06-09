// favorites.js (модель Favorites)
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Favourite extends Model {}
Favourite.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Favourite',
});

// Экспортируем модель
module.exports = Favourite;
