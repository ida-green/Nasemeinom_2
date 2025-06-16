const Like = require('../models/Like.js'); 

// Лайкнуть
async function likeItem(likeableType, likeableId, userId) {
    // Проверка входных данных
    if (!likeableType || !likeableId || !userId) {
        throw new Error('Invalid input parameters');
    }

    // Проверьте, существует ли уже лайк
    const existingLike = await Like.findOne({
        where: {
            likeable_type: likeableType,
            likeable_id: likeableId,
            user_id: userId,
        },
    });

    if (existingLike) {
        throw new Error('User already liked this item');
    }

    // Создайте новый лайк
    const newLike = await Like.create({
        likeable_type: likeableType,
        likeable_id: likeableId,
        user_id: userId,
    });

    return newLike; // Возвращаем созданный лайк
}

// Отменить лайк
async function unlikeItem(likeableType, likeableId, userId) {
    // Проверка входных данных
    if (!likeableType || !likeableId || !userId) {
        throw new Error('Invalid input parameters');
    }

    const existingLike = await Like.findOne({
        where: {
            likeable_type: likeableType,
            likeable_id: likeableId,
            user_id: userId,
        },
    });

    if (!existingLike) {
        throw new Error('User has not liked this item');
    }

    // Удалите лайк
    await existingLike.destroy();

    // Возвращаем статус или сообщение об успешном удалении
    return { message: 'Like removed successfully' };
}


// Получить все лайки
async function getLikes(likeableType, likeableId) {
    if (!likeableType || !likeableId) {
        throw new Error('Invalid input parameters for getLikes'); // Уточненное сообщение
    }

    const likes = await Like.findAll({
        where: {
            likeable_type: likeableType,
            likeable_id: likeableId,
        },
        // Опционально: если хотите также получать информацию о пользователях, поставивших лайк
        // include: [{ model: User, attributes: ['id', 'username', 'avatar'] }] // Замените User на вашу модель пользователя
    });

    return likes;
}

// Экспортируем новый метод из модуля
module.exports = { likeItem, unlikeItem, getLikes };