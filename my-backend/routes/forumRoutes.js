const express = require('express');
const { 
    getPosts, 
    getCommentsByPostId, 
    addPost, 
    editPost, 
    addComment, 
    editComment } = require('../controllers/forumController.js');
const { validationResult } = require('express-validator');
const { validateComment, validatePost } = require('../middleware/validation.js');
const authMiddleware = require('../middleware/auth.js');
const { updateLastOnlineMiddleware } = require('../middleware/updateLastOnLine.js');
const { sanitizeMessage } = require('../utils/sanitizer.js');

const router = express.Router();


// Маршрут для получения постов
router.get('/posts', getPosts);

// Маршрут для получения комментариев по ID поста
router.get('/posts/:id/comments', getCommentsByPostId);

// Создание нового поста
router.post('/posts',
    authMiddleware,
    updateLastOnlineMiddleware,
    async (req, res, next) => {
        req.body.title = sanitizeMessage(req.body.title);
        req.body.content = sanitizeMessage(req.body.content);
        next();
    },
    validatePost,
    (req, res, next) => { // Обработка ошибок валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Продолжаем обработку, если ошибок нет
    },
    addPost
);

// Создание нового комментария
router.post('/comments',
    authMiddleware,
    updateLastOnlineMiddleware,
    validateComment,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.content = sanitizeMessage(req.body.content);
        next();
    },
    addComment
);

// Редактирование поста
router.patch('/posts/:id',
    authMiddleware,
    updateLastOnlineMiddleware,
    validatePost,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.title = sanitizeMessage(req.body.title);
        req.body.content = sanitizeMessage(req.body.content);
        next();
    },
    editPost
);

// Редактирование комментария
router.patch('/comments/:id',
    authMiddleware,
    updateLastOnlineMiddleware,
    validateComment,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.content = sanitizeMessage(req.body.content);
        next();
    },
    editComment
);

module.exports = router;