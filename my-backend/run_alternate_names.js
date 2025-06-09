
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

// --- Главная функция для запуска всего процесса добавления русских названий ---
async function runAlternateNames() {
    const alternateNamesFilePath = path.join(__dirname, 'alternateNames', 'alternateNames.txt'); 

    try {
      await importAlternateNames(alternateNamesFilePath);

    } catch (error) {
        console.error('Произошла критическая ошибка во время добавления названий:', error);
    } finally {
        await sequelize.close();
        console.log('Соединение с базой данных закрыто.');
    }
}

// Запуск процесса импорта
runAlternateNames();