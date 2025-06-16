import jwt from 'jsonwebtoken';

const secretKey = 'secret'; // Используйте тот же секретный ключ, что и в вашем приложении
const payload = { id: 1 }; // Пример полезной нагрузки

// Генерация токена
const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
console.log('Сгенерированный токен:', token);

// Проверка токена
jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
        console.error('Ошибка проверки токена:', err);
    } else {
        console.log('Декодированная полезная нагрузка:', decoded);
    }
});
