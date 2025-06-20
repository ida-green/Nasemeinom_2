const { Op } = require('sequelize');
const Country = require('../models/Country.js');
const Region = require('../models/Region.js');
const City = require('../models/City.js');

const getCountries = async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 10;
        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Параметр "q" обязателен и должен содержать минимум 2 символа.' });
        }
        const countries = await Country.findAll({
            attributes: ['id', 'name_en', 'name_ru'],
            where: {
                [Op.or]: [
                    { name_en: { [Op.like]: `%${query}%` } },
                    { name_ru: { [Op.like]: `%${query}%` } }
                ]
            },
            order: [['name_en', 'ASC']],
            limit: limit
        });
        res.json(countries);
    } catch (error) {
        console.error('Ошибка при получении стран:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
};

const getRegions = async (req, res) => {
    try {
        const countryId = req.query.countryId; // ИЗМЕНЕНО: req.query.countryId
        const query = req.query.q;           // ИЗМЕНЕНО: req.query.q
        const limit = parseInt(req.query.limit) || 10;
        if (!countryId) {
            return res.status(400).json({ error: 'Country ID is required for fetching regions.' });
        }
        const regions = await Region.findAll({
            attributes: ['id', 'country_id', 'name_en', 'name_ru', 'admin1_code'],
            where: {
                country_id: countryId,
                [Op.or]: [
                    { name_en: { [Op.like]: `%${query}%` } },
                    { name_ru: { [Op.like]: `%${query}%` } }
                ]
            },
            order: [['name_en', 'ASC']],
            limit: limit
        });
        res.json(regions);
    } catch (error) {
        console.error('Ошибка при получении регионов:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
};

const getCities = async (req, res) => {
    try {
        const query = req.query.q;
        const countryId = req.query.countryId;
        const regionAdmin1Code = req.query.admin1_code;
        const limit = parseInt(req.query.limit) || 10;
        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Параметр "q" обязателен и должен содержать минимум 2 символа.' });
        }
        const whereCondition = {
            [Op.or]: [
                { name_en: { [Op.like]: `%${query}%` } },
                { name_ru: { [Op.like]: `%${query}%` } }
            ]
        };
        if (countryId) whereCondition.country_id = countryId;
        if (regionAdmin1Code) whereCondition.admin1_code = regionAdmin1Code;

        const cities = await City.findAll({
            attributes: ['id', 'country_id', 'admin1_code', 'name_en', 'name_ru', 'latitude', 'longitude'],
            where: whereCondition,
            order: [['name_en', 'ASC']],
            limit: limit
        });
        res.json(cities);
    } catch (error) {
        console.error('Ошибка при получении городов:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
};

module.exports = { getCountries, getRegions, getCities }