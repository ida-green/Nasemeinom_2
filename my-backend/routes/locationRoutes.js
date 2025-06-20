const express = require('express');
const router = express.Router();

const { getCountries, getRegions, getCities } = require('../controllers/locationController.js');

router.get('/countries', getCountries); // Параметр 'q' будет в req.query.q
router.get('/regions', getRegions);     // Параметры 'countryId' и 'q' будут в req.query
router.get('/cities', getCities);       // Параметры 'regionId' и 'q' будут в req.query


module.exports = router;