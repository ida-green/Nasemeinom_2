const { Op } = require('sequelize');
const User = require('../models/User.js'); 
const Country = require('../models/Country.js');
const Region = require('../models/Region.js');
const City = require('../models/City.js');
const Children = require('../models/Children.js');
const Gender = require('../models/Gender.js'); 
const EducationForm = require('../models/EducationForm.js'); 

/**
 * Функция для вычисления расстояния между двумя точками
 * по широте и долготе (формула Хаверсина).
 * Возвращает SQL-выражение для MariaDB.
 *
 * @param {string} lat1Column Название столбца широты первой точки (e.g., 'City.latitude')
 * @param {string} lon1Column Название столбца долготы первой точки (e.g., 'City.longitude')
 * @param {number} lat2 Значение широты второй точки (целевого города)
 * @param {number} lon2 Значение долготы второй точки (целевого города)
 * @returns {Array} Массив Sequelize Literal и его параметры
 */
function getHaversineDistanceLiteral(lat1Column, lon1Column, lat2, lon2) {
    const R = 6371; // Радиус Земли в километрах

    // Переводим градусы в радианы для SQL
    const toRadians = (deg) => `(${deg} * PI() / 180)`;

    // Вычисляем разницу широт и долгот
    const dLat = toRadians(lat2) + ` - ${toRadians(lat1Column)}`;
    const dLon = toRadians(lon2) + ` - ${toRadians(lon1Column)}`;

    // Формула Хаверсина в SQL-выражении
    // Sequelize.literal позволяет вставлять "сырой" SQL
    return [
        `
        (
            ${R} * 2 * ATAN2(
                SQRT(
                    POWER(SIN(${dLat} / 2), 2) +
                    COS(${toRadians(lat2)}) * COS(${toRadians(lat1Column)}) *
                    POWER(SIN(${dLon} / 2), 2)
                ),
                SQRT(
                    1 - (
                        POWER(SIN(${dLat} / 2), 2) +
                        COS(${toRadians(lat2)}) * COS(${toRadians(lat1Column)}) *
                        POWER(SIN(${dLon} / 2), 2)
                    )
                )
            )
        )
        `,
        [lat2, lat2, lat1Column, lon2, lon1Column] // Эти параметры, по сути, не используются в сыром SQL, но Sequelize может требовать массив
    ];
}

async function searchUsers(req, res) {
    try {
        const { country_id, region_id, city_id, radius_km, page = 1, per_page = 20, name } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(per_page);
        const limit = parseInt(per_page);

        const whereCondition = {};
        const includeOptions = [
            {
                model: Country,
                as: 'country',
                attributes: ['id', 'name_en', 'name_ru'],
                required: false // LEFT JOIN, чтобы пользователь без страны все равно отображался
            },
            {
                model: Region,
                as: 'region',
                attributes: ['id', 'name_en', 'name_ru'],
                required: false
            },
            {
                model: City,
                as: 'city',
                attributes: ['id', 'name_en', 'name_ru', 'latitude', 'longitude'],
                required: false
            },
            {
                model: Children,
                as: 'children',
                attributes: ['id', 'name', 'birth_date'], // Убрали gender_id и education_form_id отсюда
                required: false,
                // <-- ДОБАВЬТЕ ВКЛЮЧЕНИЯ ДЛЯ ПОЛА И ФОРМЫ ОБРАЗОВАНИЯ ДЕТЕЙ
                include: [
                    {
                        model: Gender,
                        as: 'gender', // Используйте тот же алиас, что и в Children.belongsTo
                        attributes: ['gender'], // Нам нужно только имя пола
                        required: false // LEFT JOIN: ребенок будет включен, даже если пол не указан
                    },
                    {
                        model: EducationForm,
                        as: 'education_form', // Используйте тот же алиас, что и в Children.belongsTo
                        attributes: ['title'], // Нам нужно только имя формы образования
                        required: false
                    }
                ]
            }
        ];

        // Фильтрация по имени пользователя
        if (name) {
            whereCondition.name = { [Op.like]: `%${name}%` };
        }

        // Фильтрация по стране, региону, городу
        if (country_id) {
            whereCondition.country_id = country_id;
        }
        
       if (region_id !== undefined && region_id !== 'null') {
            const parsedRegionId = parseInt(region_id);
            if (isNaN(parsedRegionId)) {
                return res.status(400).json({ error: 'Некорректное значение для region_id в фильтре пользователей. Ожидается числовой ID региона или строка "null".' });
            }
            whereCondition.region_id = parsedRegionId;
        }

        if (city_id) {
            whereCondition.city_id = city_id;
        }

        let users;
        let totalUsers;

        // Логика для поиска по радиусу
        if (city_id && radius_km) {
            const targetCity = await City.findByPk(city_id, {
                attributes: ['latitude', 'longitude']
            });

            if (!targetCity || targetCity.latitude === null || targetCity.longitude === null) {
                return res.status(400).json({ error: 'Город не найден или у него отсутствуют координаты для поиска по радиусу.' });
            }

            const targetLat = parseFloat(targetCity.latitude);
            const targetLon = parseFloat(targetCity.longitude);
            const radius = parseFloat(radius_km);

            // Sequelize.literal позволяет вставлять сырой SQL в условие WHERE или SELECT
            // Здесь мы используем его для вычисления расстояния
            const distanceLiteral = getHaversineDistanceLiteral(
                '`city`.`latitude`', // Прямое обращение к столбцу через псевдоним связанной модели
                '`city`.`longitude`',
                targetLat,
                targetLon
            );

            // Важно: Когда используется поиск по радиусу, условие `city_id` в `whereCondition`
            // становится более гибким, так как мы ищем не только в самом городе, но и вокруг него.
            // Если вы хотите, чтобы `city_id` фильтровал *только* в пределах этого города И по радиусу,
            // тогда `whereCondition.city_id = city_id;` должен оставаться.
            // Если же `radius_km` означает "вокруг этого города, независимо от `city_id` пользователя",
            // то `city_id` из `whereCondition` нужно убрать или сделать другим.
            // Для простоты, оставим `city_id` как базовый фильтр, а радиус как дополнительное ограничение.

            // Нам нужно получить COUNT(*) для общего количества пользователей,
            // что может быть проблемой с сложными геопространственными запросами,
            // так как Sequelize не всегда может легко посчитать `found_rows` с `include` и `literal`.
            // Проще всего выполнить два запроса: один для подсчета, второй для выборки.

            // Запрос для подсчета общего количества пользователей по условиям (включая радиус)
            const countUsersQuery = await User.findAndCountAll({
                attributes: ['id'], // Выбираем минимальные атрибуты для подсчета
                where: {
                    ...whereCondition, // Все остальные фильтры
                    // Добавляем условие по радиусу в `where`
                    [Op.and]: [
                        { '$city.id$': { [Op.ne]: null } }, // Убедимся, что у пользователя есть город для расчета
                        sequelize.literal(`${distanceLiteral[0]} <= ${radius}`) // Здесь используем Literal
                    ]
                },
                include: includeOptions,
                // group: ['User.id'] // Иногда требуется для distinct count с JOIN
                // В данном случае, так как мы хотим отфильтровать по радиусу через city, нам нужно JOIN
                // и условие на latitude/longitude City модели.
                // Sequelize автоматически добавит JOIN для `include`
            });
            totalUsers = countUsersQuery.count;


            // Запрос для получения списка пользователей с пагинацией и полной информацией
            users = await User.findAll({
                attributes: ['id', 'userImageUrl', 'name', 'description', 'familyDescription', 'last_online_at', 'familyImageUrl'], // Добавьте все нужные атрибуты пользователя
                where: {
                    ...whereCondition,
                    [Op.and]: [
                        { '$city.id$': { [Op.ne]: null } },
                        sequelize.literal(`${distanceLiteral[0]} <= ${radius}`)
                    ]
                },
                include: includeOptions,
                order: [['last_online_at', 'ASC']], // Сортировка по имени, или можно добавить опцию сортировки в запрос
                offset: offset,
                limit: limit
            });

        } else {
            // Стандартный поиск без радиуса
            const { count, rows } = await User.findAndCountAll({
                attributes: ['id', 'userImageUrl', 'name', 'description', 'familyDescription', 'familyImageUrl'], // Добавьте все нужные атрибуты пользователя
                where: whereCondition,
                include: includeOptions,
                order: [['name', 'ASC']],
                offset: offset,
                limit: limit
            });
            users = rows;
            totalUsers = count;
        }

        res.json({
            users: users,
            pagination: {
                total_users: totalUsers,
                current_page: parseInt(page),
                total_pages: Math.ceil(totalUsers / limit),
                per_page: limit
            }
        });

    } catch (error) {
        console.error('Ошибка при поиске пользователей:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
}

module.exports = { searchUsers };
