const express = require('express');
const router = express.Router();
const EducationForm = require('../models/EducationForm.js'); // Импортируйте ваши модели

// Получение всех форм образования
router.get('/educationForms', async (req, res) => {
    try {
        const educationForms = await EducationForm.findAll();
        res.json(educationForms); // Отправляем данные о Формах образования в формате JSON
    } catch (error) {
        console.error('Ошибка при получении форм образования:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении форм образования' }); // Возвращаем 500 с сообщением об ошибке
    }
});

module.exports = router;
