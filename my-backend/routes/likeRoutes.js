// routes/likeRoutes.js
const express = require('express');
const router = express.Router();
const { addLike, removeLike, getLikesForEntity } = require('../controllers/likeController.js');
const authMiddleware = require('../middleware/auth.js'); // Middleware для проверки аутентификации

// Маршрут для добавления лайка
router.post('/', authMiddleware, addLike);

// Маршрут для удаления лайка 
router.delete('/', authMiddleware, removeLike);

// Получить все лайки для определенной сущности
// Пример: GET /api/likes?likeable_type=post&likeable_id=YOUR_POST_ID
//         GET /api/likes?likeable_type=comment&likeable_id=YOUR_COMMENT_ID
router.get('/', /* authenticateToken, */ getLikesForEntity);

module.exports = router;
