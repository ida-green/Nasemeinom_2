// routes/likeRoutes.js
const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/auth'); // Middleware для проверки аутентификации

// Маршрут для добавления лайка
router.post('/', authMiddleware, likeController.addLike);

// Маршрут для удаления лайка 
router.delete('/', authMiddleware, likeController.removeLike);

// Получить все лайки для определенной сущности
// Пример: GET /api/likes?likeable_type=post&likeable_id=YOUR_POST_ID
//         GET /api/likes?likeable_type=comment&likeable_id=YOUR_COMMENT_ID
router.get('/', /* authenticateToken, */ likeController.getLikesForEntity);

module.exports = router;
