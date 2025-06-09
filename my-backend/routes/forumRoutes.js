const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { validationResult } = require('express-validator');
const { validateCreateComment, validateEditComment, validatePost } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth'); // Middleware для проверки аутентификации
const { updateLastOnlineMiddleware } = require('../middleware/updateLastOnline'); // Проверка, когда последний раз был онлайн

// Маршрут для получения постов
router.get('/posts', forumController.getPosts);

// Маршрут для получения комментариев по ID поста
router.get('/posts/:id/comments', forumController.getCommentsByPostId);

// Создание нового комментария
router.post('/comments',
  authMiddleware, // (1) Ваш "мягкий" middleware для аутентификации
  updateLastOnlineMiddleware, // (2) Ваш middleware для обновления времени активности
  validateCreateComment, // (3) Middleware для валидации входных данных
  (req, res, next) => { // (4) Обработчик результатов валидации
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      next();
  },
  forumController.addComment
);

// Создание нового поста
router.post('/posts',
  authMiddleware, // <-- Добавляем проверку аутентификации
  updateLastOnlineMiddleware,
  validatePost,
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      next();
  },
  forumController.addPost
);

// Редактирование поста
router.patch('/posts/:id',
  authMiddleware, // Проверка аутентификации
  updateLastOnlineMiddleware,
  validatePost,   // <-- Применяем валидацию для поста (она должна проверять title и content)
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      next(); // Если валидация успешна, передаем управление контроллеру
  },
  forumController.editPost
);

// Редактирование комментария
router.patch('/comments/:id',
  authMiddleware,      // Проверка аутентификации
  updateLastOnlineMiddleware,
  validateEditComment,     // <-- Применяем валидацию для комментария (она должна проверять content)
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      next(); // Если валидация успешна, передаем управление контроллеру
  },
  forumController.editComment
);

module.exports = router;
