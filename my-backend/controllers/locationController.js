const sequelize = require('../database');
const { Op } = require('sequelize'); // Для использования операторов LIKE, OR и т.д.
const Country = require('../models/Country'); // Убедитесь, что пути правильные
const Region = require('../models/Region');
const City = require('../models/City');

exports.getCountries = async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 10;

        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Параметр "q" обязателен и должен содержать минимум 2 символа.' });
        }

        // Оператор Op.iLike в Sequelize обычно переводится в ILIKE для PostgreSQL
        // или LIKE для MySQL/MariaDB с учетом регистронезависимости, если collation это позволяет.
        // Для MariaDB обычно LIKE по умолчанию регистронезависим на строковых столбцах,
        // если нет специальной COLLATE BINARY. Op.like будет работать так же.
        const countries = await Country.findAll({
            attributes: ['id', 'name_en', 'name_ru'], // Выбираем только нужные поля
            where: {
                [Op.or]: [ // Ищем совпадение в name_en или name_ru
                    { name_en: { [Op.like]: `%${query}%` } }, // Для MariaDB Op.like обычно регистронезависим
                    { name_ru: { [Op.like]: `%${query}%` } }
                ]
            },
            order: [['name_en', 'ASC']], // Сортируем для последовательных результатов
            limit: limit
        });

        res.json(countries);

    } catch (error) {
        console.error('Ошибка при получении стран:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
}

exports.getRegions = async (req, res) => {
    try {
        const query = req.query.q; // Поисковый запрос по имени региона
        const countryId = req.query.country_id; // ID страны для фильтрации (опционально)
        const limit = parseInt(req.query.limit) || 10; // Лимит результатов

        // Инициализируем пустой объект для условий WHERE
        const whereCondition = {};

        // 1. Добавляем фильтр по стране, если countryId предоставлен
        if (countryId) {
            whereCondition.country_id = countryId;
        }

        // 2. Условно добавляем фильтр по поисковому запросу 'q'
        // Если query предоставлен и имеет достаточную длину (>= 2 символов),
        // тогда применяем фильтр по имени.
        if (query && query.length >= 2) {
            whereCondition[Op.or] = [
                { name_en: { [Op.like]: `%${query}%` } },
                { name_ru: { [Op.like]: `%${query}%` } }
            ];
        }
        // Если query пустой или короткий, мы НЕ добавляем условие [Op.or]
        // Это означает, что будут возвращены все регионы, соответствующие только countryId (если он есть).

        const regions = await Region.findAll({
            attributes: ['id', 'country_id', 'name_en', 'name_ru'],
            where: whereCondition, // Используем динамически сформированное условие
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
exports.getCities = async (req, res) => {
    try {
        const query = req.query.q;
        const countryId = req.query.country_id;
        const regionId = req.query.region_id; // Это будет строка (например, '123' или 'null') или undefined
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

        if (countryId) {
            whereCondition.country_id = countryId;
        }


        // --- Измененная логика для regionId ---
        if (regionId !== undefined) { // Проверяем, был ли параметр region_id вообще передан
            if (regionId === 'null') { // Если region_id пришел как строка 'null' (от фронтенда)
                whereCondition.region_id = { [Op.is]: null }; // Ищем города, где region_id IS NULL
            } else { // Иначе предполагаем, что это ID региона (число)
                const parsedRegionId = parseInt(regionId);
                if (isNaN(parsedRegionId)) {
                    // Если значение передано, но не является числом и не 'null'
                    return res.status(400).json({ error: 'Некорректное значение для region_id. Ожидается числовой ID региона или строка "null".' });
                }
                whereCondition.region_id = parsedRegionId;
            }
        }

        
        // Если regionId === undefined (т.е. параметр region_id не был передан в запросе),
        // то условие для region_id не добавляется вообще.
        // Это означает, что будут искаться города для всей страны,
        // независимо от того, есть у них region_id или нет.
        // Это полезно, если на фронтенде регион не обязателен для выбора города.

        const cities = await City.findAll({
            attributes: ['id', 'country_id', 'region_id', 'name_en', 'name_ru', 'latitude', 'longitude'],
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


// module.exports = { getCities };