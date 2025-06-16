import bcrypt from 'bcrypt';

// Хэшированный пароль (например, полученный из базы данных)
const hashedPassword = '$2b$10$Xp0M4K3DARDn/6w4Bma0.uIEyaE1cVSJlDyWr09lDgkxwIxYT50p6';

// Введённый пользователем пароль
const enteredPassword = 'password24';

// Функция для проверки пароля
async function verifyPassword(enteredPassword, hashedPassword) {
    try {
        const match = await bcrypt.compare(enteredPassword, hashedPassword);
        if (match) {
            console.log("Пароль верный!");
        } else {
            console.log("Пароль неверный!");
        }
    } catch (error) {
        console.error("Ошибка при проверке пароля:", error);
    }
}

// Вызов функции проверки
verifyPassword(enteredPassword, hashedPassword);
