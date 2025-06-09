// my-backend/scripts/import_geonames.js

require('dotenv').config(); // Для загрузки переменных окружения из .env
const { Sequelize } = require('sequelize');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

// --- Инициализация Sequelize ---
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mariadb',
        logging: false, // Отключаем логирование SQL-запросов в консоль
        dialectOptions: {
            connectTimeout: 60000 // Увеличиваем таймаут соединения
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const Country = require('../my-backend/models/Country');
const Region = require('../my-backend/models/Region');
const City = require('../my-backend/models/City');

// Глобальные Map для хранения ID
const countryCodeMap = new Map(); // ISO-код страны -> ID страны из БД
const regionAdminCodeMap = new Map(); // `${countryId}-${admin1Code}` -> ID региона из БД

const BATCH_SIZE = 5000; // Размер пакета для bulkCreate

// --- Функция для очистки и синхронизации базы данных ---
async function clearAndSyncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Подключение к базе данных установлено.');

        console.log('Подготовка к очистке географических таблиц...');
        // 1. Временно отключаем проверку внешних ключей
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        console.log('Проверка внешних ключей временно отключена.');

        // 2. Обнуляем ссылки на географические данные в таблице users
        // Это необходимо, чтобы мы могли безопасно очистить cities, regions, countries
        // без нарушения внешних ключей и не удаляя самих пользователей.
        try {
            console.log('Обнуление географических ID в таблице users...');
            // Важно: здесь мы предполагаем, что столбцы city_id, region_id, country_id существуют в таблице users
            // и что они могут принимать NULL значения.
            await sequelize.query(`
                UPDATE users
                SET
                    city_id = NULL,
                    region_id = NULL,
                    country_id = NULL
                WHERE
                    city_id IS NOT NULL OR region_id IS NOT NULL OR country_id IS NOT NULL;
            `);
            console.log('Географические ID в таблице users обнулены. Таблица users сохранена.');
        } catch (updateError) {
            console.warn(`Внимание: Не удалось обнулить географические ID в таблице users. Возможно, столбцы не существуют или есть другие проблемы: ${updateError.message}`);
            // Если UPDATE не удался, это может означать, что этих столбцов нет,
            // или они не nullable. В последнем случае, придется изменить схему базы данных.
        }

        // 3. Очищаем географические таблицы в правильном порядке (от зависимых к независимым)
        console.log('Очистка географических таблиц: cities, regions, countries...');
        await sequelize.query('TRUNCATE TABLE cities;');
        console.log('Таблица cities очищена.');

        await sequelize.query('TRUNCATE TABLE regions;');
        console.log('Таблица regions очищена.');

        await sequelize.query('TRUNCATE TABLE countries;');
        console.log('Таблица countries очищена.');

        // 4. Включаем проверку внешних ключей обратно
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Проверка внешних ключей включена.');

        // 5. Синхронизация моделей - это восстановит все внешние ключи,
        // включая те, что ссылаются на users, cities, regions, countries.
        // `alter: true` обновит схему таблиц, если были изменения в моделях.
        await sequelize.sync({ alter: true });
        console.log('Модели синхронизированы с базой данных.');

    } catch (error) {
        console.error('Ошибка при синхронизации или очистке базы данных:', error);
        process.exit(1); // Завершаем процесс при критической ошибке
    }
}

// --- Функция для импорта стран (ПЕРВЫЙ ПРОХОД) ---
async function importCountries(filePath) {
    console.log(`Начинаем импорт стран из файла: ${filePath}`);
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let importedCount = 0;
    let batch = [];

    for await (const line of rl) {
        if (line.trim() === '') continue;
        const parts = line.split('\t');
        if (parts.length < 19) continue;

        const featureCode = parts[7];
        // GeoNames feature codes для стран: PCL, PCLF, PCLI, PCLS, PCLD
        if (!['PCL', 'PCLF', 'PCLI', 'PCLS', 'PCLD'].includes(featureCode)) {
            continue; // Пропускаем, если это не страна
        }

        const countryData = {
            geonameId: parseInt(parts[0]),
            name_en: parts[1],
            iso_code: parts[8].trim(), // Важно: убираем пробелы!
            latitude: parseFloat(parts[4]),
            longitude: parseFloat(parts[5]),
            population: parseInt(parts[14]) || 0, // Убедитесь, что 0, а не null для населения
            feature_code: featureCode
        };

        // Базовая валидация данных перед добавлением в пакет
        if (isNaN(countryData.geonameId) || !countryData.name_en || !countryData.iso_code ||
            isNaN(countryData.latitude) || isNaN(countryData.longitude)) {
            console.warn(`Пропущена некорректная строка для страны: ${line.substring(0, 80)}...`);
            continue;
        }

        batch.push(countryData);

        if (batch.length >= BATCH_SIZE) {
            try {
                // bulkCreate с { returning: true } позволяет получить созданные экземпляры
                const createdCountries = await Country.bulkCreate(batch, { returning: true });
                createdCountries.forEach(country => {
                    // Заполняем countryCodeMap
                    countryCodeMap.set(country.iso_code, country.id);
                });
                importedCount += batch.length;
                console.log(`Импортировано стран: ${importedCount}`);
                batch = []; // Очищаем пакет
            } catch (error) {
                console.error('Ошибка при пакетной вставке стран:', error.message);
                // Можно добавить логику для повторной попытки или пропуска проблемных записей
                batch = []; // Сбросить пакет, чтобы не застрять на ошибке
            }
        }
    }

    // Вставляем оставшиеся записи после окончания чтения файла
     if (batch.length > 0) {
        try {
            console.log('Попытка финальной вставки, размер пакета:', batch.length);
            // console.log('Содержимое финального пакета:', batch); // Можно раскомментировать, если пакет маленький, иначе будет много вывода
            const createdCountries = await Country.bulkCreate(batch, { returning: true });
            createdCountries.forEach(country => {
                countryCodeMap.set(country.iso_code, country.id);
            });
            importedCount += batch.length;
        }  catch (error) {
        console.error('Ошибка при финальной вставке стран:');
        console.error('Имя ошибки:', error.name);        // Часто будет 'SequelizeValidationError'
        console.error('Сообщение об ошибке:', error.message); // Общее сообщение
        if (error.errors && error.errors.length > 0) {
            console.error('Детали валидации:');
            error.errors.forEach(err => {
                console.error(` - Поле: ${err.path}, Значение: ${err.value}, Ошибка: ${err.message}`);
            });
        } else {
            console.error(error); // Вывести весь объект ошибки, если нет специфичных ошибок валидации
        }
        }
    }

    console.log(`Завершён импорт стран. Всего импортировано: ${importedCount}`);
    console.log(`Размер countryCodeMap после импорта стран: ${countryCodeMap.size}`);
    // Если хотите убедиться, что map не пуст, можно вывести несколько элементов:
    // console.log('Некоторые элементы countryCodeMap:', Array.from(countryCodeMap.entries()).slice(0, 5));
}

// --- Функция для импорта регионов (ВТОРОЙ ПРОХОД) ---
async function importRegions(filePath) {
    console.log(`\n--- Начинаем импорт регионов из файла: ${filePath} ---`);
    console.log(`Размер countryCodeMap в начале importRegions: ${countryCodeMap.size}`);

    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let importedCount = 0;
    let batch = [];
    let processedLines = 0;
    let skippedByFeatureCode = 0;
    let skippedByCountryId = 0;
    let skippedByDataValidation = 0;

    // --- ДОБАВЬТЕ ЭТИ ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ readline ---
    let firstLineLogged = false;
    rl.on('line', (line) => {
        if (!firstLineLogged) {
            console.log(`[importRegions] Первая строка от readline: ${line.substring(0, 100)}...`);
            firstLineLogged = true;
        }
    });

    rl.on('error', (err) => {
        console.error('[importRegions] Ошибка при чтении файла (readline):', err);
    });

    rl.on('close', () => {
        console.log('[importRegions] Чтение файла завершено (readline close event).');
    });
    // --- КОНЕЦ ДОБАВЛЕННЫХ ОБРАБОТЧИКОВ ---


    for await (const line of rl) {
        processedLines++;
        // if (processedLines % 100000 === 0) { // Опционально: логгировать прогресс чтения файла
        //     console.log(`[importRegions] Прочитано строк: ${processedLines}`);
        // }

        if (line.trim() === '') continue;
        const parts = line.split('\t');
        if (parts.length < 19) {
            skippedByDataValidation++;
            continue;
        }

        const featureCode = parts[7];
        if (!featureCode.startsWith('ADM1')) { // Убедитесь, что здесь 'ADM', а не 'ADM1'
            skippedByFeatureCode++;
            continue;
        }

        const countryCode = parts[8].trim();
        const countryId = countryCodeMap.get(countryCode);
        const admin1Code = parts[10].trim();

        if (countryId === undefined) {
            skippedByCountryId++;
            continue;
        }

        const regionData = {
            geonameId: parseInt(parts[0]),
            name_en: parts[1],
            country_id: countryId,
            admin1_code: admin1Code,
            latitude: parseFloat(parts[4]),
            longitude: parseFloat(parts[5]),
            population: parseInt(parts[14]) || 0,
            feature_code: featureCode
        };

        if (isNaN(regionData.geonameId) || !regionData.name_en || regionData.name_en.trim() === '' ||
            isNaN(regionData.latitude) || isNaN(regionData.longitude)) {
            skippedByDataValidation++;
            continue;
        }

        batch.push(regionData);

     if (batch.length >= BATCH_SIZE) {
            try {
                // Добавьте { ignoreDuplicates: true } вторым аргументом
                const createdRegions = await Region.bulkCreate(batch, { returning: true, ignoreDuplicates: true }); 
                createdRegions.forEach(region => {
                    // Убедитесь, что regionAdminCodeMap заполняется только для успешно созданных регионов
                    regionAdminCodeMap.set(`${region.country_id}-${region.admin1_code}`, region.id);
                });
                importedCount += createdRegions.length; // Используйте createdRegions.length, так как часть могла быть пропущена
                console.log(`Импортировано регионов: ${importedCount} (Всего обработано строк: ${processedLines})`);
                batch = []; 
            } catch (error) {
                console.error('КРИТИЧЕСКАЯ ОШИБКА при пакетной вставке регионов. Пакет сброшен:', error);
                batch = [];
            }
        }
    }

     if (batch.length > 0) {
        try {
            const createdRegions = await Region.bulkCreate(batch, { returning: true, ignoreDuplicates: true }); // Добавьте здесь тоже
            createdRegions.forEach(region => {
                regionAdminCodeMap.set(`${region.country_id}-${region.admin1_code}`, region.id);
            });
            importedCount += createdRegions.length; // Используйте createdRegions.length
        } catch (error) {
            console.error('КРИТИЧЕСКАЯ ОШИБКА при финальной вставке регионов. Пакет сброшен:', error);
        }
    }

    console.log(`\n--- Завершён импорт регионов ---`);
    console.log(`Всего строк в файле обработано: ${processedLines}`);
    console.log(`Пропущено из-за неподходящего featureCode (не ADM): ${skippedByFeatureCode}`);
    console.log(`Пропущено из-за отсутствия Country ID в Map: ${skippedByCountryId}`);
    console.log(`Пропущено из-за невалидных данных (пустое имя, невалидные координаты и т.п.): ${skippedByDataValidation}`);
    console.log(`Всего успешно импортировано регионов: ${importedCount}`);
    console.log(`Финальный размер regionAdminCodeMap: ${regionAdminCodeMap.size}`);
}

// --- Функция для импорта городов (ТРЕТИЙ ПРОХОД) ---
async function importCities(filePath) {
    console.log(`Начинаем импорт городов из файла: ${filePath}`);
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let importedCount = 0;
    let batch = [];
    for await (const line of rl) {
        if (line.trim() === '') continue;
        const parts = line.split('\t');
        if (parts.length < 19) continue;
        const featureCode = parts[7];
        if (!featureCode.startsWith('PPL')) continue; // Пропускаем, если это не город

        const countryCode = parts[8].trim();
        const admin1Code = parts[10].trim(); // Код региона для города (если есть)
        const countryId = countryCodeMap.get(countryCode);
        if (countryId === undefined) continue;

        const cityData = {
            geonameId: parseInt(parts[0]),
            name_en: parts[1],
            country_id: countryId,
            region_id: null, // Важно: region_id устанавливаем как null
            latitude: parseFloat(parts[4]),
            longitude: parseFloat(parts[5]),
            population: parseInt(parts[14]) || 0, // Обработка отсутствующего населения
            feature_code: featureCode,
            admin1_code: admin1Code, // Добавляем admin1_code
        };

        // Проверка на корректность данных
        if (isNaN(cityData.geonameId) || !cityData.name_en || isNaN(cityData.latitude) || isNaN(cityData.longitude)) continue;

        batch.push(cityData);
        if (batch.length >= BATCH_SIZE) {
            try {
                await City.bulkCreate(batch);
                importedCount += batch.length;
                {/*}
                console.log(`Импортировано городов: ${importedCount}`);
                */}
                batch = [];
            } catch (error) {
                console.error('Ошибка при пакетной вставке городов:', error);
                batch = []; // Очищаем batch после ошибки
            }
        }
    }

    // Обработка остатка batch
    if (batch.length > 0) {
        try {
            await City.bulkCreate(batch);
            importedCount += batch.length;
        } catch (error) {
            console.error('Ошибка при финальной вставке городов:', error);
        }
    }

    console.log(`Завершён импорт городов. Всего импортировано: ${importedCount}`);

    // Обновление region_id после импорта всех городов
    await updateCityRegionIds();
}


async function updateCityRegionIds() {
    const citiesWithoutRegion = await City.findAll({ where: { region_id: null } });
    console.log(`Updating region_id for ${citiesWithoutRegion.length} cities...`);
    for (const city of citiesWithoutRegion) {
        const region = await Region.findOne({
            where: {
                country_id: city.country_id,
                admin1_code: city.admin1_code,
            },
        });
        if (region) {
            await city.update({ region_id: region.id });
            console.log(`Updated region_id for city ${city.geonameId}`);
        } else {
            console.warn(`Region not found for city ${city.geonameId}, country_id: ${city.country_id}, admin1_code: ${city.admin1_code}`);
        }
    }
    console.log("Finished updating city region_ids.");
}



// ... (где-то после других функций импорта, но до runGeoNamesImport)

// Импортируем Op для использования оператора IN
const { Op } = require('sequelize');

// Дополнительная константа для размера пакета обновления (меньше, чем для bulkCreate, т.к. SQL-запрос с CASE WHEN может быть большим)
const ALTERNATE_NAMES_BATCH_SIZE = 2000; 

async function importAlternateNames(filePath) {
    console.log(`\n--- Начинаем импорт русских названий из файла: ${filePath} ---`);

    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let processedLines = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Map для хранения geonameId -> name_ru для текущего пакета
    // Используем Map, чтобы автоматически обрабатывать дубликаты (берем последнее встреченное имя)
    const currentBatch = new Map();

    for await (const line of rl) {
        processedLines++;
        if (line.trim() === '') continue;
        const parts = line.split('\t');

        // alternateNames.txt имеет 9 колонок (0-8)
        // 1: geonameId
        // 3: isoLanguage
        // 4: alternateName
        if (parts.length < 5) { // Проверяем, что достаточно колонок для нужных данных
            skippedCount++;
            continue;
        }

        const geonameId = parseInt(parts[1]);
        const isoLanguage = parts[2]; // <-- ПРАВИЛЬНЫЙ ИНДЕКС ДЛЯ ЯЗЫКА
        const alternateName = parts[3]; // <-- ПРАВИЛЬНЫЙ ИНДЕКС ДЛЯ АЛЬТЕРНАТИВНОГО ИМЕНИ
        

        if (isNaN(geonameId) || !alternateName || alternateName.trim() === '') {
            skippedCount++;
            continue;
        }

        // Фильтруем по русскому языку
        if (isoLanguage === 'ru') {
            currentBatch.set(geonameId, alternateName.trim());
        } else {
            skippedCount++; // Пропускаем другие языки
        }

        if (currentBatch.size >= ALTERNATE_NAMES_BATCH_SIZE) {
            try {
                const batchUpdates = await processAlternateNamesBatch(currentBatch);
                updatedCount += batchUpdates;
                console.log(`Обновлено русских названий: ${updatedCount} (Всего обработано строк alternateNames: ${processedLines})`);
                currentBatch.clear(); // Очищаем пакет
            } catch (error) {
                console.error('КРИТИЧЕСКАЯ ОШИБКА при пакетном обновлении русских названий:', error);
                // Продолжаем, чтобы не прерывать весь импорт, но логируем ошибку
                currentBatch.clear(); // Очищаем пакет, чтобы не зацикливаться на проблемных данных
            }
        }
    }

    // Обрабатываем оставшиеся записи после окончания чтения файла
    if (currentBatch.size > 0) {
        try {
            const batchUpdates = await processAlternateNamesBatch(currentBatch);
            updatedCount += batchUpdates;
        } catch (error) {
            console.error('КРИТИЧЕСКАЯ ОШИБКА при финальном обновлении русских названий:', error);
        }
    }

    console.log(`\n--- Завершён импорт русских названий ---`);
    console.log(`Всего строк alternateNames обработано: ${processedLines}`);
    console.log(`Пропущено (не "ru" язык, некорректные данные): ${skippedCount}`);
    console.log(`Всего успешно обновлено названий: ${updatedCount}`);
}

// Вспомогательная функция для обработки пакета русских названий
async function processAlternateNamesBatch(batchMap) {
    if (batchMap.size === 0) return 0;

    const geonameIds = Array.from(batchMap.keys());

    // Строим части для выражения CASE WHEN
    let countryCaseWhen = '';
    let regionCaseWhen = '';
    let cityCaseWhen = '';

    batchMap.forEach((name_ru, geonameId) => {
        const escapedName = name_ru.replace(/'/g, "''"); // Экранируем одинарные кавычки для SQL
        countryCaseWhen += `WHEN ${geonameId} THEN '${escapedName}' `;
        regionCaseWhen += `WHEN ${geonameId} THEN '${escapedName}' `;
        cityCaseWhen += `WHEN ${geonameId} THEN '${escapedName}' `;
    });

    let totalUpdatedInBatch = 0;

    // Обновляем страны
    if (countryCaseWhen) {
        const [updatedRowsCount] = await Country.update(
            { name_ru: sequelize.literal(`CASE geonameId ${countryCaseWhen} ELSE name_ru END`) },
            { where: { geonameId: { [Op.in]: geonameIds } } }
        );
        totalUpdatedInBatch += updatedRowsCount;
    }

    // Обновляем регионы
    if (regionCaseWhen) {
        const [updatedRowsCount] = await Region.update(
            { name_ru: sequelize.literal(`CASE geonameId ${regionCaseWhen} ELSE name_ru END`) },
            { where: { geonameId: { [Op.in]: geonameIds } } }
        );
        totalUpdatedInBatch += updatedRowsCount;
    }

    // Обновляем города
    if (cityCaseWhen) {
        const [updatedRowsCount] = await City.update(
            { name_ru: sequelize.literal(`CASE geonameId ${cityCaseWhen} ELSE name_ru END`) },
            { where: { geonameId: { [Op.in]: geonameIds } } }
        );
        totalUpdatedInBatch += updatedRowsCount;
    }

    return totalUpdatedInBatch;
}




// --- Главная функция для запуска всего процесса импорта ---
async function runGeoNamesImport() {
    const filePath = path.join(__dirname, 'allCountries', 'allCountries.txt');
    const alternateNamesFilePath = path.join(__dirname, 'alternateNames', 'alternateNames.txt'); // <-- НОВЫЙ ПУТЬ

    try {
        await clearAndSyncDatabase();

        // 1. Импорт стран
        await importCountries(filePath);

        // 2. Импорт регионов
        await importRegions(filePath); 

        // 3. Импорт городов
        await importCities(filePath);

        // 4. Импорт русских названий (ДОБАВЬТЕ ЭТО)
        await importAlternateNames(alternateNamesFilePath);

        console.log('Импорт данных GeoNames завершен успешно!');

    } catch (error) {
        console.error('Произошла критическая ошибка во время импорта:', error);
    } finally {
        await sequelize.close();
        console.log('Соединение с базой данных закрыто.');
    }
}

// Запуск процесса импорта
runGeoNamesImport();