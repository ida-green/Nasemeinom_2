const express = require('express');
const router = express.Router();

const locationController = require('../controllers/locationController');
// const userController = require('../controllers/userController'); // Раскомментируем, когда создадим userController

// Маршруты для получения данных о локациях (для автодополнения и выпадающих списков)

// GET /api/locations/countries - Получить страны по поисковому запросу
router.get('/countries', locationController.getCountries);

// Получить регионы по поисковому запросу (опционально по стране)
router.get('/countries/:countryId/regions', locationController.getRegions);

// Получить города по поисковому запросу
router.get('/cities', locationController.getCities); // <<-- ЭТОТ МАРШРУТ

module.exports = router;