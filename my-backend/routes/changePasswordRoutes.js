const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize'); 
const User = require('../models/User.js'); 
const router = express.Router();

// Маршрут для запроса восстановления пароля

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(400).send('Пользователь с таким email не найден.');
    }

    // Генерация токена
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Токен действителен 1 час

    await user.save();

    // Настройка Nodemailer
    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru', // или другой SMTP-сервер
        port: 465, // или 465 для SSL
        secure: true, // true для 465, false для других портов
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER, // Ваш email
        subject: 'Восстановление пароля "На семейном"',
        text: `Вы получили это письмо, потому что вы (или кто-то другой) запросили восстановление пароля для вашего аккаунта на сайте "На семейном".\n\n` +
              `Пожалуйста, перейдите по следующей ссылке, чтобы сбросить ваш пароль:\n\n` +
              `http://localhost:3001/reset-password/${token}\n\n` +
              `Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.\n`
    };

    await transporter.sendMail(mailOptions);

    res.send('Инструкция для сброса пароля была отправлена на ваш email. Письмо придет в течение минуты. Если письмо не приходит, проверьте папку "Спам".');
});

// Маршрут для сброса пароля
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;

    // Проверка на наличие пароля
    if (!password) {
        console.log('Ошибка: Пароль не предоставлен.');
        return res.status(400).send('Введите пароль.');
    }

    try {
        // Поиск пользователя по токену
        const user = await User.findOne({
            where: {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { [Op.gt]: Date.now() } // Используем Op для сравнения
            }
        });

        if (!user) {
            console.log('Ошибка: Токен недействителен или истек.');
            return res.status(400).send('Токен недействителен или истек.');
        }

        // Хэширование нового пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Новый хэшированный пароль:', hashedPassword); // Логирование нового пароля

        // Обновление пароля пользователя
        user.password = hashedPassword;
        user.resetPasswordToken = null; // Сброс токена
        user.resetPasswordExpires = null; // Сброс времени действия токена

        // Сохранение изменений
        await user.save();
        console.log('Пароль успешно изменен'); // Логирование успешного изменения

        return res.status(200).send('Пароль успешно изменен.');
    } catch (error) {
        console.error('Ошибка при смене пароля:', error); // Логирование ошибки
        return res.status(500).send('Ошибка при смене пароля.');
    }
});


module.exports = router;