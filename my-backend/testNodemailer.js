import nodemailer from 'nodemailer';
import 'dotenv/config'; 
import authenticateToken from './middleware/auth'; 

const transporter = nodemailer.createTransport({
    service: 'yandex', // Или 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'zinaidarukhova@yandex.ru', // Замените на ваш email
    subject: 'Тестовое письмо',
    text: 'Это тестовое письмо.',
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Ошибка при отправке письма:', error);
    }
    console.log('Письмо отправлено:', info.response);
});
