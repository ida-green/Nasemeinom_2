const sequelize = require('../database');
const Like = require('../models/Like'); 
const likeService = require('../services/likeService'); // Импортируем сервис

// Контроллер для добавления лайка
async function addLike(req, res) {
    try {
        // Получаем данные
        const { likeable_type, likeable_id } = req.body;
        const user_id = req.user.id; // Получаем ID пользователя из объекта req.user

        // Вызываем сервисную функцию для добавления лайка
        const newLike = await likeService.likeItem(likeable_type, likeable_id, user_id);
        res.status(201).json(newLike);
    } catch (error) {
        console.error("Error in addLike controller:", error.message);
        if (error.message === 'User already liked this item' || error.message === 'Invalid input parameters') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while adding like' });
    }
}

// Контроллер для удаления лайка
async function removeLike(req, res) {
    try {
        // Получаем данные
        const { likeable_type, likeable_id } = req.body;
        const user_id = req.user.id; // Получаем ID пользователя из объекта req.user

        // Вызываем сервисную функцию для удаления лайка
        await likeService.unlikeItem(likeable_type, likeable_id, user_id);
        res.status(204).send(); // Успешное удаление, нет тела ответа
    } catch (error) {
        console.error("Error in removeLike controller:", error.message);
        if (error.message === 'User has not liked this item' || error.message === 'Invalid input parameters') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while removing like' });
    }
}

// Новый контроллер для получения лайков для сущности
async function getLikesForEntity(req, res) {
    try {
        // Мы будем ожидать likeable_type и likeable_id в query параметрах
        // Например: GET /api/likes?likeable_type=post&likeable_id=123
        const { likeable_type, likeable_id } = req.query;

        // Базовая валидация на уровне контроллера (сервис тоже валидирует)
        if (!likeable_type || !likeable_id) {
            return res.status(400).json({ message: 'likeable_type and likeable_id query parameters are required.' });
        }

        const likes = await likeService.getLikes(likeable_type, likeable_id);
        res.status(200).json(likes);
    } catch (error) {
        console.error("Error in getLikesForEntity controller:", error.message);
        if (error.message === 'Invalid input parameters for getLikes') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while fetching likes' });
    }
}

module.exports = {
    addLike,
    removeLike,
    getLikesForEntity 
};

