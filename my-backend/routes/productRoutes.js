const express = require('express');
const router = express.Router();

const Course = require('../models/Course.js');
const Subject = require('../models/Subject.js');
const Aspect = require('../models/Aspect.js');
const CourseFormat = require('../models/CourseFormat.js');

const AgeMax = require('../models/AgeMax.js');
const AgeMin = require('../models/AgeMin.js');
const AgeRange = require('../models/AgeRange.js');
const AgeFilter = require('../models/AgeFilter.js');

const GradeMax = require('../models/GradeMax.js');
const GradeMin = require('../models/GradeMin.js');
const GradeRange = require('../models/GradeRange.js');
const GradeFilter = require('../models/GradeFilter.js');

const LiveGroup = require('../models/LiveGroup.js');
const LiveSession = require('../models/LiveSession.js');

const PriceOption = require('../models/PriceOption.js');
const PriceHistory = require('../models/PriceHistory.js');

const Author = require('../models/Author.js');
const Provider = require('../models/Provider.js');
const Platform = require('../models/Platform.js');

const Review = require('../models/Review.js');
const User = require('../models/User.js');

router.get('/courses', async (req, res) => {
  try {
      const courses = await Course.findAll({
          include: [
              { model: Author },
              { model: AgeMin },
              { model: AgeMax },
              { model: GradeMin },
              { model: GradeMax },
              { model: Review },
              { model: PriceOption },
              { model: PriceHistory },
              {
                  model: LiveGroup,
                  include: [LiveSession]
              },
              { model: Provider },
              {
                  model: Aspect, // Включаем модель Aspect для связи "многие ко многим"
                  through: { attributes: [] } // Исключаем атрибуты промежуточной таблицы
              },
              {
                  model: Subject, // Включаем модель Subject для связи "многие ко многим"
                  through: { attributes: [] } // Исключаем атрибуты промежуточной таблицы
              },
          ]
      });
      res.json(courses);
  } catch (error) {
    console.error('Ошибка при получении курсов:', error);
    res.status(500).json({ error: 'Ошибка при получении курсов', details: error.message });
}
});

  
  router.get('/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    {/*console.log('Запрос на получение курса с ID: ${courseId}');*/}
    
    try {
      const course = await Course.findByPk(courseId, {
        include: [
          { model: Author },
            { model: AgeMin },
            { model: AgeMax },
            { model: GradeMin },
            { model: GradeMax },
            { model: Review },
            { model: PriceOption },
            { model: PriceHistory },
        
          {
            model: LiveGroup,
            include: [
              LiveSession,
            ]
          },
          {
            model: Provider,
          },
          {
            model: Aspect, // Добавляем модель Aspect
            through: { attributes: [] } // Убираем атрибуты промежуточной таблицы, если они не нужны
          },
          {
            model: Subject, 
            through: { attributes: [] } // Убираем атрибуты промежуточной таблицы, если они не нужны
          },
        ]
      });
  
      if (!course) {
        console.log('Курс не найден');
        return res.status(404).json({ error: 'Курс не найден' });
      }
  
      {/*console.log('Курс получен:', course);*/}
      res.json(course);
    } catch (error) {
      console.error('Ошибка при получении курса:', error);
      res.status(500).json({ error: 'Ошибка при получении курса' });
    }
  });
  
  router.get('/formats', async (req, res) => {
    {/*console.log('Запрос на получение предметов');*/}
    try {
      const formats = await CourseFormat.findAll();
      {/*console.log('Форматы получены:', subjects);*/}
      res.json(formats);
    } catch (error) {
      console.error('Ошибка при получении форматов:', error);
      res.status(500).json({ error: 'Ошибка при получении форматтов' });
    }
  });

  router.get('/subjects', async (req, res) => {
    {/*console.log('Запрос на получение предметов');*/}
    try {
      const subjects = await Subject.findAll();
      {/*console.log('Предметы получены:', subjects);*/}
      res.json(subjects);
    } catch (error) {
      console.error('Ошибка при получении предметов:', error);
      res.status(500).json({ error: 'Ошибка при получении предметов' });
    }
  });

  router.get('/aspects', async (req, res) => {
    {/*console.log('Запрос на получение предметов');*/}
    try {
      const aspects = await Aspect.findAll();
      {/*console.log('Предметы получены:', subjects);*/}
      res.json(aspects);
    } catch (error) {
      console.error('Ошибка при получении аспектов:', error);
      res.status(500).json({ error: 'Ошибка при получении аспектов' });
    }
  });

  router.get('/ageFilters', async (req, res) => {
    {/*console.log('Запрос на получение предметов');*/}
    try {
      const ageFilters = await AgeFilter.findAll();
      {/*console.log('Предметы получены:', subjects);*/}
      res.json(ageFilters);
    } catch (error) {
      console.error('Ошибка при получении Фильтров по возрасту:', error);
      res.status(500).json({ error: 'Ошибка при получении фильтров по возрасту' });
    }
  });

  router.get('/gradeFilters', async (req, res) => {
    {/*console.log('Запрос на получение предметов');*/}
    try {
      const gradeFilters = await GradeFilter.findAll();
      {/*console.log('Предметы получены:', subjects);*/}
      res.json(gradeFilters);
    } catch (error) {
      console.error('Ошибка при получении Фильтров по классу:', error);
      res.status(500).json({ error: 'Ошибка при получении фильтров по классу' });
    }
  });

  router.get('/authors', async (req, res) => {
    {/*console.log('Запрос на получение предметов');*/}
    try {
      const authors = await Author.findAll();
      {/*console.log('Предметы получены:', subjects);*/}
      res.json(authors);
    } catch (error) {
      console.error('Ошибка при получении Фильтров авторов:', error);
      res.status(500).json({ error: 'Ошибка при получении фильтров авторов' });
    }
  });

  router.get('/providers', async (req, res) => {
    {/*console.log('Запрос на получение предметов');*/}
    try {
      const providers = await Provider.findAll();
      {/*console.log('Предметы получены:', subjects);*/}
      res.json(providers);
    } catch (error) {
      console.error('Ошибка при получении Фильтров авторов:', error);
      res.status(500).json({ error: 'Ошибка при получении фильтров авторов' });
    }
  });

  router.get('/reviews', async (req, res) => {
    {/*console.log('Запрос на получение отзывов');*/}
    try {
      const users = await Review.findAll({
          include: [
            {
              model: User,
            },
          ]
      });
      {/*console.log('Отзывы получены:', users);*/}
      res.json(users);
    } catch (error) {
      console.error('Ошибка при получении отзывов:', error);
      res.status(500).json({ error: 'Ошибка при получении отзывов' });
    }
  });  

  module.exports = router;