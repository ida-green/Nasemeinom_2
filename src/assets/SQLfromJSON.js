async function importData() {
  let connection = null;
  try {
    const data = JSON.parse(await fs.readFile(jsonFilePath, 'utf8'));
    connection = await mysql.createConnection(connectionConfig);

    for (const countryData of data) {
      const [countryResult] = await connection.execute(
        'INSERT INTO countries (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [countryData.name]
      );
      const countryId = countryResult.insertId || (await getCountryId(countryData.name));

      for (const regionData of countryData.regions) {
        const [regionResult] = await connection.execute(
          'INSERT INTO regions (country_id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
          [countryId, regionData.region]
        );
        const regionId = regionResult.insertId || (await getRegionId(countryId, regionData.region));

        for (const cityName of regionData.cities) {
          await connection.execute(
            'INSERT INTO cities (region_id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
            [regionId, cityName]
          );
        }
      }
    }
    console.log('Данные успешно импортированы.');
  } catch (error) {
    console.error('Ошибка при импорте данных:', error);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (endError) {
        console.error('Ошибка при закрытии соединения:', endError);
      }
    }
  }
}

async function getCountryId(countryName) {
  const [rows] = await connection.execute('SELECT id FROM countries WHERE name = ?', [countryName]);
  return rows[0]?.id;
}

async function getRegionId(countryId, regionName) {
  const [rows] = await connection.execute('SELECT id FROM regions WHERE country_id = ? AND name = ?', [countryId, regionName]);
  return rows[0]?.id;
}

importData();
