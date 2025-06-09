// src/components/UserFilter.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from '../../utils/debounce'; // Импортируем нашу функцию debounce

const UserFilter = ({ onFilterChange, currentFilters }) => {
  // Состояние для полей ввода и выбранных ID
  const [searchTermName, setSearchTermName] = useState(currentFilters.name || '');
  const [searchTermCountry, setSearchTermCountry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null); // Объект { id, name_ru, name_en }
  const [searchTermRegion, setSearchTermRegion] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [searchTermCity, setSearchTermCity] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [radiusKm, setRadiusKm] = useState(currentFilters.radius_km || '');

  // Состояние для предложений автозаполнения
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [regionSuggestions, setRegionSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);

  //Состояния для хранения списков доступных регионов и городов:
  const [availableRegions, setAvailableRegions] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

// ---- Главный useEffect для инициализации фильтров из currentFilters ----
useEffect(() => {
    // === ДОБАВЬТЕ ЭТУ ПРОВЕРКУ ===
    if (!currentFilters) {
        return; // Если currentFilters еще не определен, выходим из хука
    }
    // =============================
    // Инициализация общего поля поиска по имени
    setSearchTermName(currentFilters.name || '');
    setRadiusKm(currentFilters.radius_km || ''); // Инициализация радиуса

    const loadSelectedLocationNames = async () => {
        // --- 1. Загрузка выбранной страны ---
        // Проверяем, есть ли country_id в текущих фильтрах и не выбран ли уже страна в UI
        if (currentFilters.country_id && !selectedCountry) {
            try {
                const response = await axios.get(`http://localhost:3000/api/locations/countries/${currentFilters.country_id}`);
                setSelectedCountry(response.data);
                setSearchTermCountry(response.data.name_ru || response.data.name_en);
            } catch (err) {
                console.error("Ошибка при загрузке выбранной страны из фильтров:", err);
                setSelectedCountry(null); // Очистить, если ошибка или не найдено
                setSearchTermCountry('');
            }
        }

        // --- 2. Загрузка выбранного региона ---
        // Важно: проверяем .hasOwnProperty('region_id') на случай, если currentFilters.region_id
        // равен null (это значение), а не просто отсутствует (undefined)
        if (currentFilters.hasOwnProperty('region_id') && !selectedRegion) {
            if (currentFilters.region_id === null) {
                // Если region_id в фильтрах равен null, устанавливаем специальный объект "Без региона"
                setSelectedRegion({ id: 'null', name_en: 'No Region', name_ru: 'Без региона' });
                setSearchTermRegion('Без региона'); // Отобразить "Без региона" в поле ввода
            } else if (currentFilters.region_id) { // Если region_id - это числовой ID (не null и не 0/false)
                try {
                    const response = await axios.get(`http://localhost:3000/api/locations/regions/${currentFilters.region_id}`);
                    setSelectedRegion(response.data);
                    setSearchTermRegion(response.data.name_ru || response.data.name_en);
                } catch (err) {
                    console.error("Ошибка при загрузке выбранного региона из фильтров:", err);
                    setSelectedRegion(null); // Очистить, если ошибка или не найдено
                    setSearchTermRegion('');
                }
            }
            // Если currentFilters.region_id === undefined (то есть параметра не было в URL),
            // то этот блок не выполнится, и selectedRegion останется null,
            // что соответствует состоянию "регион не выбран".
        }

        // --- 3. Загрузка выбранного города ---
        if (currentFilters.city_id && !selectedCity) {
            try {
                const response = await axios.get(`http://localhost:3000/api/locations/cities/${currentFilters.city_id}`);
               setSelectedCity(response.data);
            setSearchTermCity(response.data.name_ru || response.data.name_en);
        } catch (err) {
            console.error("Ошибка при загрузке выбранного города из фильтров:", err);
            setSelectedCity(null); // Очистить, если ошибка или не найдено
            setSearchTermCity('');
        }
    }
};

// Запускаем асинхронную функцию загрузки
loadSelectedLocationNames();

setRadiusKm(currentFilters.radius_km || '');

  }, [
currentFilters, // Зависимость: перезапускать, если currentFilters меняются
// Добавьте все сеттеры состояний, используемые в этом useEffect,
// чтобы React не выдавал предупреждений о "stale closures"
setSelectedCountry, setSearchTermCountry,
setSelectedRegion, setSearchTermRegion,
setSelectedCity, setSearchTermCity,
setSearchTermName, setRadiusKm,
// А также сами стейты, которые проверяются в условиях (selectedCountry, selectedRegion, selectedCity),
// чтобы хук реагировал, если они меняются извне этого хука (хотя в данном случае они меняются внутри).
selectedCountry, selectedRegion, selectedCity
]);



 // ---- 2. useEffect для загрузки доступных регионов при смене страны ----
useEffect(() => {
// Этот useEffect запускается при изменении выбранной страны
if (selectedCountry?.id) { // Проверяем, что страна действительно выбрана
const fetchRegionsForCountry = async () => {
try {
// Запрос регионов для выбранной страны. Параметр q=пусто означает "все"
const response = await axios.get(`http://localhost:3000/api/locations/regions?country_id=${selectedCountry.id}&q=`);
// Создаем специальную опцию "Без региона"
            const noRegionOption = { id: 'null', name_en: 'No Region', name_ru: 'Без региона' };

            // Добавляем опцию "Без региона" в начало списка доступных регионов
            setAvailableRegions([noRegionOption, ...response.data]);

            // Сбрасываем выбранные регион и город при смене страны
            setSelectedRegion(null);
            setSearchTermRegion(''); // Сброс поискового запроса для региона
            setSelectedCity(null);
            setSearchTermCity(''); // Сброс поискового запроса для города
            setAvailableCities([]); // Очищаем список городов
        } catch (err) {
            console.error("Ошибка при загрузке регионов для страны:", err);
            setAvailableRegions([]); // Очищаем список регионов в случае ошибки
        }
    };
    fetchRegionsForCountry();
} else {
    // Если страна не выбрана (или выбор сброшен), очищаем списки регионов и городов
    setAvailableRegions([]);
    setSelectedRegion(null);
    setSearchTermRegion('');
    setSelectedCity(null);
    setSearchTermCity('');
    setAvailableCities([]);
}
}, [
selectedCountry, // Зависимость: этот хук сработает при каждом изменении selectedCountry
// Добавьте все сеттеры состояний, чтобы избежать предупреждений ESLint
setAvailableRegions, setSelectedRegion, setSearchTermRegion,
setSelectedCity, setSearchTermCity, setAvailableCities
]);

  // ---- Функции для получения предложений автозаполнения (используем ваши API) ----

  const fetchCountrySuggestions = useCallback(debounce(async (term) => {
    if (term.length < 2) {
      setCountrySuggestions([]);
      return;
    }
    try {
      // ИСПОЛЬЗУЕМ ВАШ ЭНДПОИНТ: /api/locations/countries?q=...
      const response = await axios.get(`http://localhost:3000/api/locations/countries?q=${term}&limit=10`);
      setCountrySuggestions(response.data); // Ожидаем массив [{ id, name_en, name_ru }]
    } catch (error) {
      console.error('Ошибка при получении стран:', error);
      setCountrySuggestions([]);
    }
  }, 300), []);

 // 1. fetchRegionSuggestions - ДОБАВЛЯЕТ ОПЦИЮ "БЕЗ РЕГИОНА" В ПРЕДЛОЖЕНИЯ
const fetchRegionSuggestions = useCallback(debounce(async (countryId, term) => {
    if (!countryId || term.length < 2) {
        setRegionSuggestions([]);
        return;
    }
    try {
        const response = await axios.get(`http://localhost:3000/api/locations/regions?countryId=${countryId}&q=${term}&limit=10`);

        // Создаем специальную опцию "Без региона"
        const noRegionOption = { id: 'null', name_en: 'No Region', name_ru: 'Без региона' };

        // Добавляем опцию "Без региона" в начало списка предложений
        setRegionSuggestions([noRegionOption, ...response.data]);
    } catch (error) {
        console.error('Ошибка при получении регионов:', error);
        setRegionSuggestions([]);
    }
}, 300), []);

 
// 2. fetchCitySuggestions - ПРИНИМАЕТ countryId И ОБРАБАТЫВАЕТ regionId
const fetchCitySuggestions = useCallback(debounce(async (countryId, regionId, term) => {
        if (!term || term.length < 2) { // <- Добавлена проверка !term
        setCitySuggestions([]);
        return;
    }
    if (!countryId) { // Город всегда привязан к стране
        setCitySuggestions([]);
        console.warn('Невозможно получить города: countryId не передан.');
        return;
    }
    try {
        let url = `http://localhost:3000/api/locations/cities?country_id=${countryId}&q=${term}&limit=10`;
        // Если regionId явно передан (даже если это 'null' как строка), добавляем его.
        // Если regionId === undefined (т.е. не было выбрано ни региона, ни опции "без региона"),
        // то его не добавляем, и бэкенд будет искать города по всей стране.
        if (regionId !== undefined) {
            url += `&region_id=${regionId}`;
        }

        const response = await axios.get(url);
        setCitySuggestions(response.data);
    } catch (error) {
        console.error('Ошибка при получении городов:', error);
        setCitySuggestions([]);
    }
}, 300), []);



  // ---- Эффекты для вызова функций получения предложений ----
  useEffect(() => {
    fetchCountrySuggestions(searchTermCountry);
  }, [searchTermCountry, fetchCountrySuggestions]);

  useEffect(() => {
    if (selectedCountry) {
      fetchRegionSuggestions(selectedCountry.id, searchTermRegion);
    } else {
      setRegionSuggestions([]);
    }
  }, [searchTermRegion, selectedCountry, fetchRegionSuggestions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchCitySuggestions(selectedRegion.id, searchTermCity);
    } else {
      setCitySuggestions([]);
    }
  }, [searchTermCity, selectedRegion, fetchCitySuggestions]);


  // ---- Обработчики выбора из списка предложений ----

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setSearchTermCountry(country.name_ru || country.name_en); // Предпочитаем русское название
    setCountrySuggestions([]); // Скрываем предложения
    // Сбрасываем зависимые поля и их ID
    setSelectedRegion(null);
    setSearchTermRegion('');
    setSelectedCity(null);
    setSearchTermCity('');
    setRadiusKm(''); // Сброс радиуса, т.к. город изменился
  };

  // 3. handleSelectRegion - ОБРАБАТЫВАЕТ ВЫБОР ОПЦИИ "БЕЗ РЕГИОНА"
const handleSelectRegion = (region) => {
    if (region.id === 'null') { // Если выбрана опция "Без региона"
        setSelectedRegion({ id: 'null', name_en: 'No Region', name_ru: 'Без региона' });
        setSearchTermRegion('Без региона'); // Отображаем в инпуте
    } else {
        setSelectedRegion(region);
        setSearchTermRegion(region.name_ru || region.name_en);
    }
    // После выбора региона, сбрасываем город
    setSelectedCity(null);
    setSearchTermCity('');
    setCitySuggestions([]); // Очищаем предложения городов
    setRadiusKm('');
    setRegionSuggestions([]); // Скрываем предложения регионов
};

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setSearchTermCity(city.name_ru || city.name_en);
    setCitySuggestions([]);
  };

  // ---- Применение фильтров ----
  const handleApplyFilters = () => {
    onFilterChange({
      name: searchTermName,
      country_id: selectedCountry ? selectedCountry.id : null,
      region_id: selectedRegion ? selectedRegion.id : null,
      city_id: selectedCity ? selectedCity.id : null,
      radius_km: radiusKm ? radiusKm : null,
    });
  };

  const handleClearFilters = () => {
    setSearchTermName('');
    setSearchTermCountry('');
    setSelectedCountry(null);
    setSearchTermRegion('');
    setSelectedRegion(null);
    setSearchTermCity('');
    setSelectedCity(null);
    setRadiusKm('');
    onFilterChange({ // Отправляем пустые фильтры
        name: '',
        country_id: null,
        region_id: null,
        city_id: null,
        radius_km: '',
    });
  }


  return (
    <div className="row user-filter">
      <div className="col-12 filter-group">
        <label htmlFor="country-search">Страна:</label>
        <input
          id="country-search"
          type="text"
          value={searchTermCountry}
          onChange={(e) => {
            const term = e.target.value;
            setSearchTermCountry(term);
            // Если пользователь начал вводить что-то, что не соответствует выбранной стране,
            // сбрасываем выбор страны и все связанные поля.
            if (selectedCountry && selectedCountry.id && (selectedCountry.name_ru !== term && selectedCountry.name_en !== term)) {
                setSelectedCountry(null);
                setSelectedRegion(null);
                setSearchTermRegion('');
                setRegionSuggestions([]); // Сбросить предложения регионов
                setSelectedCity(null);
                setSearchTermCity('');
                setCitySuggestions([]); // Сбросить предложения городов
                setRadiusKm('');
            }
            // Вызываем функцию для получения предложений стран
            fetchCountrySuggestions(term);
          }}
          placeholder="Начните вводить название страны"
        />
        {countrySuggestions.length > 0 && (
          <ul className="suggestions-list">
            {countrySuggestions.map((country) => (
              <li key={country.id} onClick={() => {
                // При выборе страны, устанавливаем ее и сбрасываем предложения
                handleSelectCountry(country); // Ваша существующая функция handleSelectCountry
                setCountrySuggestions([]);
              }}>
                {country.name_ru} {country.name_en && country.name_ru !== country.name_en && `(${country.name_en})`}
              </li>
            ))}
          </ul>
        )}
        {selectedCountry && <p>Выбрана страна: <strong>{selectedCountry.name_ru || selectedCountry.name_en}</strong></p>}
      </div>

      <div className="col-12 filter-group">
        <label htmlFor="region-search">Регион:</label>
        <input
          id="region-search"
          type="text"
          value={searchTermRegion}
          onChange={(e) => {
            const term = e.target.value;
            setSearchTermRegion(term);
            // Если пользователь начал вводить что-то, что не соответствует выбранному региону,
            // сбрасываем выбор региона и города
            if (selectedRegion && selectedRegion.id && (selectedRegion.name_ru !== term && selectedRegion.name_en !== term)) {
                setSelectedRegion(null);
                setSelectedCity(null);
                setSearchTermCity('');
                setCitySuggestions([]); // Сбросить предложения городов
                setRadiusKm('');
            }
            // Вызываем функцию для получения предложений регионов (уже включает "Без региона")
            if (selectedCountry) {
                fetchRegionSuggestions(selectedCountry.id, term);
            } else {
                setRegionSuggestions([]);
            }
          }}
          placeholder="Начните вводить название региона"
          disabled={!selectedCountry} // Отключаем, если страна не выбрана
        />
        {regionSuggestions.length > 0 && (
          <ul className="suggestions-list">
            {regionSuggestions.map((region) => (
              <li key={region.id} onClick={() => {
                // При выборе региона, устанавливаем его и сбрасываем предложения
                handleSelectRegion(region); // Ваша модифицированная функция handleSelectRegion
                setRegionSuggestions([]);
              }}>
                {region.name_ru} {region.name_en && region.name_ru !== region.name_en && `(${region.name_en})`}
              </li>
            ))}
          </ul>
        )}
        {/* Отображаем выбранный регион, учитывая специальный объект "Без региона" */}
        {selectedRegion && <p>Выбран регион: <strong>{selectedRegion.name_ru || selectedRegion.name_en}</strong></p>}
      </div>

      <div className="col-12 filter-group">

    <label htmlFor="city-search">Город:</label>
    <input
      id="city-search"
      type="text"
      value={searchTermCity}
      onChange={(e) => {
        const term = e.target.value;
        setSearchTermCity(term);
        // Если пользователь начал вводить что-то, что не соответствует выбранному городу,
        // сбрасываем выбор города
        if (selectedCity && selectedCity.id && (selectedCity.name_ru !== term && selectedCity.name_en !== term)) {
            setSelectedCity(null);
            setRadiusKm('');
        }
        // Вызов fetchCitySuggestions теперь происходит в useEffect,
        // который следит за searchTermCity, selectedCountry, selectedRegion.
        // Здесь просто обновляем searchTermCity.
      }}
      placeholder="Начните вводить название города"
      // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Отключаем только если страна не выбрана, НЕ регион.
      disabled={!selectedCountry}
    />
    {citySuggestions.length > 0 && (
      <ul className="suggestions-list">
        {citySuggestions.map((city) => (
          <li key={city.id} onClick={() => {
            // При выборе города, устанавливаем его и сбрасываем предложения
            handleSelectCity(city); // Ваша существующая функция handleSelectCity
            setCitySuggestions([]);
          }}>
            {city.name_ru} {city.name_en && city.name_ru !== city.name_en && `(${city.name_en})`}
          </li>
        ))}
      </ul>
    )}
    {selectedCity && <p>Выбран город: <strong>{selectedCity.name_ru || selectedCity.name_en}</strong></p>}
  </div>

  {selectedCity && (
    <div className="col-12 filter-group">
      <label htmlFor="radius-km">Радиус (км):</label>
      <input
        id="radius-km"
        type="number"
        value={radiusKm}
        onChange={(e) => setRadiusKm(e.target.value)}
        placeholder="Введите радиус"
        min="0"
      />
    </div>
  )}






      <div className="filter-actions">
        <button 
          className="btn button-btn button-btn-primary mt-3 mb-3"
          onClick={handleApplyFilters}>Применить фильтры</button>
        <button 
          type="button" 
          className="btn button-btn button-btn-outline-primary mt-3 mb-3"
          onClick={handleClearFilters}>Очистить фильтры</button>
      </div>

      {/* Простая стилизация для списка предложений */}
      <style jsx>{`
        .suggestions-list {
          list-style: none;
          padding: 0;
          margin: 5px 0;
          border: 1px solid #ddd;
          max-height: 150px;
          overflow-y: auto;
          background: white;
          position: absolute; /* Или relative, в зависимости от контекста */
          width: 100%; /* Или фиксированная ширина */
          z-index: 100;
          box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
        }
        .suggestions-list li {
          padding: 8px 10px;
          cursor: pointer;
        }
        .suggestions-list li:hover {
          background-color: #f0f0f0;
        }
        .filter-group {
            margin-bottom: 15px;
            position: relative; /* Для позиционирования списка предложений */
        }
        .filter-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .filter-group input {
            width: calc(100% - 20px);
            padding: 8px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default UserFilter;
