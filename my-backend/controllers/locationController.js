const { Op } = require('sequelize');
const Country = require('../models/Country.js');
const Region = require('../models/Region.js');
const City = require('../models/City.js');

const getCountries = async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 10; // Обработка случая, когда limit не задан

        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Параметр "q" обязателен и должен содержать минимум 2 символа.' });
        }

        const countries = await Country.findAll({
            attributes: ['id', 'name_en', 'name_ru'],
            where: {
                [Op.or]: [
                    { name_en: { [Op.iLike]: `%${query}%` } }, // Используем Op.iLike для регистронезависимого поиска
                    { name_ru: { [Op.iLike]: `%${query}%` } }
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
        // !!! ИЗМЕНЕНИЕ 1: Получаем countryId из параметров URL, а не из query
        const countryId = req.params.countryId; // Предполагается, что маршрут выглядит как /countries/:countryId/regions

        // !!! ИЗМЕНЕНИЕ 2: Получаем поисковый запрос из параметра 'name', а не 'q'
        const query = req.query.name; 

        const limit = parseInt(req.query.limit) || 10;

        const whereCondition = {};

        // Обязательно проверяем наличие countryId, так как без него запрос может быть нелогичным
        if (!countryId) {
            return res.status(400).json({ error: 'Country ID is required for fetching regions.' });
        }
        whereCondition.country_id = countryId;

        // Условно добавляем фильтр по поисковому запросу 'name'
        if (query && query.length >= 2) {
            whereCondition[Op.or] = [
                { name_en: { [Op.iLike]: `%${query}%` } },
                { name_ru: { [Op.iLike]: `%${query}%` } }
            ];
        }
        // Если query пустой или короткий (менее 2 символов), мы НЕ добавляем условие [Op.or]
        // Это означает, что будут возвращены все регионы, соответствующие только countryId,
        // но с лимитом, что хорошо.

        const regions = await Region.findAll({
            attributes: ['id', 'country_id', 'name_en', 'name_ru', 'admin1_code'],
            where: whereCondition,
            order: [['name_en', 'ASC']],
            limit: limit
        });

        res.json(regions);

    } catch (error) {
        console.error('Ошибка при получении регионов:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
};

// Контроллер для получения городов
const getCities = async (req, res) => {
    try {
        const query = req.query.q;
        const countryId = req.query.country_id;
        const regionAdmin1Code = req.query.admin1_code; // <<< НОВОЕ ИМЯ ПАРАМЕТРА
        const limit = parseInt(req.query.limit) || 10; // Добавил || 10
        
        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Параметр "q" обязателен и должен содержать минимум 2 символа.' });
        }

        const whereCondition = {
            [Op.or]: [
                { name_en: { [Op.iLike]: `%${query}%` } },
                { name_ru: { [Op.iLike]: `%${query}%` } }
            ]
        };

        if (countryId) {
            whereCondition.country_id = countryId;
        }

         // --- Измененная логика для admin1_code ---
        if (regionAdmin1Code) { // Если admin1_code передан (даже если он пустая строка, это можно отфильтровать)
            // Мы передаем его как строку, поэтому просто используем его
            whereCondition.admin1_code = regionAdmin1Code;
        } else {
            // Если regionAdmin1Code не передан или пустой, это означает "Без региона",
            // тогда мы явно ищем города, у которых admin1_code равен null или пустой строке
            // Если вы хотите, чтобы это означало "города со всеми admin1_code",
            // то просто уберите эту ветку else и не добавляйте условие.
            // Но обычно "Без региона" означает города, у которых нет admin1_code.
            // Проверьте вашу базу данных: есть ли города БЕЗ admin1_code, которые должны отображаться при "Без региона"?
            // Если да, то `Op.or: [{ admin1_code: { [Op.is]: null } }, { admin1_code: '' }]` может быть нужен.
            // Для простоты, пока оставим так: если admin1_code не передан, мы НЕ добавляем фильтр по admin1_code.
            // То есть, ищем во ВСЕХ городах страны.
            // Это более логично для "Без региона".
        }

        // Для отладки: console.log('whereCondition for cities:', whereCondition);

        const cities = await City.findAll({
            attributes: ['id', 'country_id', 'admin1_code', 'name_en', 'name_ru', 'latitude', 'longitude'], // <<< ДОБАВЛЕНО admin1_code
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