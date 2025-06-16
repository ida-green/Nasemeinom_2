const express = require('express');
const router = express.Router();

const { getCountries, getRegions, getCities } = require('../controllers/locationController.js');
// const userController = require('../controllers/userController'); // Раскомментируем, когда создадим userController

// Маршруты для получения данных о локациях (для автодополнения и выпадающих списков)

// GET /api/locations/countries - Получить страны по поисковому запросу
router.get('/countries', getCountries);

// Получить регионы по поисковому запросу (опционально по стране)
router.get('/countries/:countryId/regions', getRegions);

// Получить города по поисковому запросу
router.get('/cities', getCities); // <<-- ЭТОТ МАРШРУТ

module.exports = router;