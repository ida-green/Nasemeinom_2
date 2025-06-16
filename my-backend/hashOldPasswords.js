import bcrypt from 'bcrypt';
import User from './models/User'; // Подключение модели пользователя

async function hashPasswords() {
    try {
        const users = await User.findAll(); // Получаем всех пользователей из базы данных

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10); // Хэшируем пароль
            user.password = hashedPassword; // Обновляем пароль в модели пользователя
            await user.save(); // Сохраняем изменения в базе данных
        }

        console.log('Пароли успешно хэшированы.');
    } catch (error) {
        console.error('Ошибка при хэшировании паролей:', error);
    }
}

hashPasswords();
