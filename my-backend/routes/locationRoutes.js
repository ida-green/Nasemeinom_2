const express = require('express');
const router = express.Router();

const locationController = require('../controllers/locationController');
// const userController = require('../controllers/userController'); // Раскомментируем, когда создадим userController

// Маршруты для получения данных о локациях (для автодополнения и выпадающих списков)

// GET /api/locations/countries - Получить страны по поисковому запросу
router.get('/countries', locationController.getCountries);

// GET /api/locations/regions - Получить регионы по поисковому запросу (опционально по стране)
router.get('/regions', locationController.getRegions);

// GET /api/locations/cities - Получить города по поисковому запросу (опционально по стране/региону)
router.get('/cities', locationController.getCities);


// Маршрут для поиска пользователей (будет реализован позже)

// GET /api/users/search - Получить список пользователей по различным фильтрам
// router.get('/users/search', userController.searchUsers); // Закомментировано пока нет userController

module.exports = router;