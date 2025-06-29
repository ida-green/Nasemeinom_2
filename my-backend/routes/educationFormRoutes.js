const express = require('express');
const router = express.Router();
const EducationForm = require('../models/EducationForm.js'); 
const Gender = require('../models/Gender.js'); 

// Получение всех форм образования
router.get('/', async (req, res) => {
    try {
        const educationForms = await EducationForm.findAll();
        res.json(educationForms); // Отправляем данные о Формах образования в формате JSON
    } catch (error) {
        console.error('Ошибка при получении форм образования:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении форм образования' }); // Возвращаем 500 с сообщением об ошибке
    }
});

router.get('/genders', async (req, res) => {
    try {
        const genders = await Gender.findAll();
        res.json(genders); // Отправляем данные о Формах образования в формате JSON
    } catch (error) {
        console.error('Ошибка при получении опций выбора пола:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении опций выбора пола' }); // Возвращаем 500 с сообщением об ошибке
    }
});


module.exports = router;
