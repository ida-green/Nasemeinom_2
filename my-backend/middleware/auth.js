// middleware/auth.js
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

// Важное замечание: С таким "мягким" authenticateToken вам обязательно нужно будет делать проверку if (!req.user) в каждом контроллере, который требует авторизации. Но это именно то, что вы сейчас и делаете, так что это соответствует вашему текущему подходу.

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];if (!token) {
    // Если токена нет, просто переходим к следующему обработчику.
    // req.user останется undefined.
    return next();
}

jwt.verify(token, secretKey, (err, user) => {
    if (err) {
        // Если токен недействителен, также переходим к следующему обработчику,
        // но не устанавливаем req.user.
        // Возможно, здесь стоит логировать ошибку токена.
        console.warn('Недействительный JWT токен:', err.message);
        return next();
    }
    req.user = user; // Сохраняем данные пользователя в объекте запроса
    next(); // Переходим к следующему обработчику
});
}

module.exports = authenticateToken;

  
