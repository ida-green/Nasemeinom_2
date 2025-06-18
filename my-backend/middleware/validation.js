const { body } = require('express-validator');

// Улучшенное регулярное выражение для проверки URL (более строгое)
const urlRegex = /^(?:https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i; 

// Функция для проверки длины строки и потенциально опасных символов
const validateLengthAndChars = (maxLength, fieldName) => (value) => {
  if (value.length > maxLength) {
    throw new Error(`${fieldName} слишком длинный (максимум ${maxLength} символов).`);
  }
  return true;
};

// Валидация для создания поста
const validatePost = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 255 }).withMessage('Заголовок не может быть пустым и должен быть короче 255 символов.')
        .custom(validateLengthAndChars(255, 'Заголовок')),
    body('content')
        .trim()
        .isLength({ min: 1, max: 4000 }).withMessage('Содержимое поста не может быть пустым и должно быть короче 10000 символов.')
        .custom(validateLengthAndChars(4000, 'Содержимое поста'))        
];

// Валидация для создания комментария
const validateCreateComment = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 4000 }).withMessage('Комментарий должен содержать от 1 до 4000 символов.')
        .custom(validateLengthAndChars(4000, 'Комментарий'))
        .custom((value) => {
          const urls = value.match(urlRegex);
          if (urls) {
            for (const url of urls) {
              if (!urlRegex.test(url)) {
                throw new Error(`Некорректный URL: ${url}`);
              }
            }
          }
          return true;
        }),
    body('postId')
        .isInt().withMessage('ID поста должен быть целым числом.'),
    body('parentId')
        .optional()
        .isInt({ allow_leading_plus: false }).withMessage('ID родительского комментария должен быть целым числом или null.'), // Улучшенная проверка
];

// Валидация для редактирования комментария
const validateEditComment = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 4000 }).withMessage('Содержимое комментария должно содержать от 1 до 4000 символов.')
        .custom(validateLengthAndChars(4000, 'Комментарий'))
        .custom((value) => {
          const urls = value.match(urlRegex);
          if (urls) {
            for (const url of urls) {
              if (!urlRegex.test(url)) {
                throw new Error(`Некорректный URL: ${url}`);
              }
            }
          }
          return true;
        }),
    body('parentId')
        .optional()
        .isInt({ allow_leading_plus: false }).withMessage('ID родительского комментария должен быть целым числом или null.')
];

module.exports = { validateCreateComment, validateEditComment, validatePost };
