//authRoutes.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Children = require('../models/Children');
const authenticateToken = require('../middleware/auth'); // Импортируем функцию аутентификации
const userController = require('../controllers/userController');

// Маршрут для получения всех пользователей с их семьями и локациями
router.get('/', userController.searchUsers);

// Получение данных текущего пользователя
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // Извлекаем id пользователя из токена
        const userId = req.user.id; 
        
        // Ищем пользователя в базе данных и включаем данные о детях
        const user = await User.findByPk(userId, {
            include: [{
                model: Children,
                as: 'Children' // Убедитесь, что это соответствует имени ассоциации
            }]
        });

        if (!user) {
            return res.sendStatus(404); // Если пользователь не найден, возвращаем 404
        }

        // Возвращаем данные пользователя с детьми
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            login: user.login,
            userImageUrl: user.userImageUrl,
            phone: user.phone,
            description: user.description,
            country: user.country_id,
            region: user.region_id,
            city: user.city_id,
            familyDescription: user.familyDescription,
            familyImageUrl: user.familyImageUrl,
            children: user.Children // Добавляем детей в ответ
        });
    } catch (error) {
        console.error(error);
        res.sendStatus(500); // Возвращаем 500 в случае ошибки сервера
    }
});

// Обновление данных текущего пользователя
router.put('/me', authenticateToken, async (req, res) => {
    const { name, email, phone, login } = req.body; // Поля, которые вы хотите обновить

    // Проверка входящих данных
    if (!name && !email && !phone && !login) {
        return res.status(400).json({ message: 'Хотя бы одно поле должно быть указано для обновления' });
    }

    try {
        const userId = req.user.id; // Извлекаем id пользователя из токена
        const user = await User.findByPk(userId); // Ищем пользователя в базе данных

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' }); // Если пользователь не найден, возвращаем 404
        }

        // Обновляем поля пользователя
        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (phone) updatedFields.phone = phone;
        if (login) updatedFields.login = login;

        await user.update(updatedFields); // Сохраняем изменения в базе данных

        res.json({ message: 'Данные пользователя успешно обновлены', user: user.dataValues }); // Возвращаем обновленные данные
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message }); // Возвращаем 500 с сообщением об ошибке
    }
});

// Обновление данных о детях текущего пользователя
router.put('/userChildren', authenticateToken, async (req, res) => {
    const { children } = req.body; // Поля, которые вы хотите обновить

    // Проверка входящих данных
    if ( !children ) {
        return res.status(400).json({ message: 'Хотя бы один ребенок должен быть указан, если есть дети'});
    }

    try {
        const userId = req.user.id; // Извлекаем id пользователя из токена
        const user = await User.findByPk(userId); // Ищем пользователя в базе данных

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' }); // Если пользователь не найден, возвращаем 404
        }

        // Обновляем поля пользователя
        const updatedFields = {};
        if (children) updatedFields.children = children;

        await user.update(updatedFields); // Сохраняем изменения в базе данных

        res.json({ message: 'Данные семьи пользователя успешно обновлены', user: user.dataValues }); // Возвращаем обновленные данные
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message }); // Возвращаем 500 с сообщением об ошибке
    }
});



  
module.exports = router;
