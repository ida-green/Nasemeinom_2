const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const User = require('../models/User.js');
const Cart = require('../models/Cart.js');
const { Op } = require('sequelize'); 
require('dotenv/config');
const { ImapFlow } = require('imapflow');
   
const secretKey = process.env.JWT_SECRET; 
const authenticateToken = require('../middleware/auth.js'); 

// Функция для обработки ошибок
const handleError = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({ message });
};
console.log('Email:', process.env.EMAIL_USER);
console.log('Password:', process.env.EMAIL_PASS);

// Обработчик регистрации
router.post('/register', async (req, res) => {
    const { name, login, email, password } = req.body;

    // Проверка на существование пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return handleError(res, 'Пользователь с таким email уже существует.', 400);
    }

    try {
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, login, email, password: hashedPassword });

        await newUser.save();

        // Создание корзины для нового пользователя
        const newCart = await Cart.create({ userId: newUser.id });
        console.log('Корзина создана:', newCart);

        // Генерация токена для подтверждения
        const token = crypto.randomBytes(32).toString('hex');
        newUser.confirmationToken = token; 
        await newUser.save();

        // Настройка Nodemailer
        const transporter = nodemailer.createTransport({
            pool: true,
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Подтверждение регистрации "На семейном"',
            html: `<p>Пожалуйста, подтвердите вашу регистрацию, перейдя по следующей ссылке: <a href="http://localhost:3001/confirm/${token}">Подтвердить регистрацию</a></p>`,
        };

        // Отправка письма
        await transporter.sendMail(mailOptions);
        console.log('Письмо отправлено');

        // Отправляем ответ пользователю
        return res.status(201).json({ message: 'Пользователь успешно зарегистрирован. Проверьте вашу почту для подтверждения.' });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        return handleError(res, 'Ошибка при регистрации пользователя.');
    }
});

// Проверка существования пользователя
router.post('/check-user', async (req, res) => {
    const { email, login } = req.body; // Убираем name

    if (!email && !login) {
        return handleError(res, 'Email или login должны быть указаны', 400);
    }

    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    email ? { email } : null,
                    login ? { login } : null,
                ].filter(Boolean)
            }
        });
        return res.json({ exists: !!existingUser });
    } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
        return handleError(res, 'Ошибка сервера');
    }
});


// Подтверждение аккаунта по email - направляем пользователью на email ссылку, просим нажать, чтобы подтвердить email
router.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ where: { confirmationToken: token } });

        if (!user) {
            return handleError(res, 'Токен подтверждения недействителен или истек.', 404);
        }

        if (user.isActive) {
            return handleError(res, 'Ваш аккаунт уже активирован.', 400);
        }

        user.isActive = true;
        user.confirmationToken = null; 
        await user.save();

        res.send('Ваш аккаунт подтвержден! Теперь вы можете войти в систему.');
    } catch (error) {
        console.error(error);
        handleError(res, 'Произошла ошибка при активации вашего аккаунта.');
    }
});

//
router.post('/auth/confirm', async (req, res) => {
    const { token } = req.body;

    try {
        const userId = verifyToken(token); // функция для проверки токена
        if (!userId) {
            return res.status(400).json({ success: false });
        }

        // Обновите статус пользователя в базе данных
        await User.updateOne({ _id: userId }, { confirmed: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Новый маршрут для чтения писем
router.get('/read-emails', authenticateToken, async (req, res) => {
    const imapConfig = {
        host: 'imap.mail.ru',
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    };

    const client = new ImapFlow(imapConfig);

    try {
        await client.connect();
        
        // Открываем почтовый ящик "Входящие"
        const lock = await client.getMailboxLock('INBOX');
        try {
            const messages = await client.fetch('1:*', { envelope: true });
            const emailSubjects = [];
            for await (let msg of messages) {
                emailSubjects.push(msg.envelope.subject);
            }
            res.json(emailSubjects);
        } finally {
            lock.release();
        }

    } catch (error) {
        console.error('Ошибка при чтении писем:', error);
        return handleError(res, 'Ошибка при чтении писем.');
    } finally {
        await client.logout();
    }
});

// Вход пользователя
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Проверка на наличие email и пароля
    if (!email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }

    try {
        // Поиск пользователя по email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Неверный email' });
        }

        // Проверка пароля
        const isMatch = await user.validatePassword(password);
        console.log('Результат сравнения паролей:', isMatch); // Логирование результата сравнения

        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный пароль' });
        }

        // Генерация токена
        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '8h' });

        // Формируем объект с данными пользователя
        const userData = {
            id: user.id,
            name: user.name,
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return res.json({ user: userData, token });

    } catch (error) {
        console.error('Ошибка при обработке запроса:', error); // Логирование ошибки
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
