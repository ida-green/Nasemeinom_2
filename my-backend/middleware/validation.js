const { body } = require('express-validator');

// Регулярное выражение для проверки URL
const urlRegex = `/^(ftp|http|https)://[^s]+$/`;

// Функция для проверки наличия URL в заголовке
const validateUrlsInTitle = (value) => {
    const urls = value.match(`/(?:https?://)?(?:www.)?[^s]+.[^s]+/g`);
    if (urls) {
        throw new Error('Заголовок не может содержать ссылки.');
    }
    return true;
};

// Функция для проверки URL в содержимом
const validateUrls = (value) => {
    const urls = value.match(`/(?:https?://)?(?:www.)?[^s]+.[^s]+/g`);
    if (urls) {
        for (let url of urls) {
            if (`!/^https?:///i.test(url)`) {
                url = 'http://' + url; // Или используйте 'https://' в зависимости от ваших требований
            }
            if (!urlRegex.test(url)) {
                throw new Error('Некорректный URL: ' + url);
            }
        }
    }
    return true;
};

// Валидация для создания комментария с проверкой на вредоносные ссылки
const validateCreateComment = [
    body('content')
        .trim()
        .isLength({ min: 1 }).withMessage('Комментарий должен содержать хотя бы один знак.')
        .custom(validateUrls),
    body('postId')
        .isInt().withMessage('ID поста должен быть целым числом.'),
    body('parentId')
        .optional()
        .custom(value => {
            if (value !== null && !Number.isInteger(value)) {
                throw new Error('ID родительского комментария должен быть целым числом или null.');
            }
            return true; // если всё в порядке, возвращаем true
        })
];


// Валидация для РЕДАКТИРОВАНИЯ комментария (postId здесь не нужен)
const validateEditComment = [
    body('content')
        .trim()
        .isLength({ min: 1 }).withMessage('Содержимое комментария не может быть пустым.') // Более подходящее сообщение
        .custom(validateUrls),
    // postId здесь НЕ ВКЛЮЧАЕМ, так как он не должен приходить в PATCH запросе
    body('parentId') // Если редактирование комментария может включать смену родителя
        .optional() // Сделать его опциональным, если он может быть не передан при редактировании
        .custom(value => {
            if (value !== null && !Number.isInteger(value)) {
                throw new Error('ID родительского комментария должен быть целым числом или null.');
            }
            return true;
        })
];


// Валидация для создания поста с проверкой на вредоносные ссылки
const validatePost = [
    body('title')
        .trim()
        .isLength({ min: 1 }).withMessage('Заголовок не может быть пустым.')
        .custom(validateUrlsInTitle), // Добавляем проверку на наличие ссылок в заголовке
    body('content')
        .trim()
        .isLength({ min: 1 }).withMessage('Содержимое поста не может быть пустым.')
        .custom(validateUrls) // Проверка на наличие ссылок в содержимом
   ];

module.exports = { validateCreateComment, validateEditComment, validatePost };
