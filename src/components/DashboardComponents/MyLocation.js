import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';

const MyLocation = ({ user, userData }) => {  
const [initialData, setInitialData] = useState(userData);        
const [isEditing, setIsEditing] = useState(false);    

const [searchTermCountry, setSearchTermCountry] = useState(initialData.country?.name_ru || initialData.country?.name_en || '');
const [searchTermRegion, setSearchTermRegion] = useState(initialData.region?.name_ru || initialData.Data.region?.name_en || '');
const [searchTermCity, setSearchTermCity] = useState(initialData.city?.name_ru || initialData.city?.name_en || '');

const [countrySuggestions, setCountrySuggestions] = useState([]);
const [regionSuggestions, setRegionSuggestions] = useState([]);
const [citySuggestions, setCitySuggestions] = useState([]);

const [selectedCountry, setSelectedCountry] = useState(initialData.country || null);
const [selectedRegion, setSelectedRegion] = useState(initialData.region || null);
const [selectedCity, setSelectedCity] = useState(initialData.city || null);

// Флаги для управления видимостью списков
const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
const [showCitySuggestions, setShowCitySuggestions] = useState(false);

// Инициализация состояния при изменении initialData
    useEffect(() => {
        if (initialData) {
            setSearchTermCountry(initialData.country.name_ru || '');
            setSearchTermRegion(initialData.region.name_ru || '');
            setSearchTermCity(initialData.city.name_ru || '');
        }
    }, [initialData]);

const fetchSuggestionsCountry = useCallback(async (query) => {
        if (query.length < 2) return;
        try {
            const response = await axios.get(`http://localhost:3000/api/locations/countries?q=${query}`);
            setCountrySuggestions(response.data);
            setShowCountrySuggestions(true); // Показываем список предложений
        } catch (error) {
            console.error('Ошибка при получении стран:', error);
            setCountrySuggestions([]);
        }
    }, []);

    const fetchSuggestionsRegion = useCallback(async (countryId, query) => {
        if (query.length < 2) return;
        try {
            const response = await axios.get(`http://localhost:3000/api/locations/regions?countryId=${countryId}&q=${query}`);
            setRegionSuggestions(response.data);
            setShowRegionSuggestions(true); // Показываем список предложений
        } catch (error) {
            console.error('Ошибка при получении регионов:', error);
            setRegionSuggestions([]);
        }
    }, []);

    const fetchSuggestionsCity = useCallback(async (countryId, admin1Code, query) => {
    if (query.length < 2) return;
    try {
        const response = await axios.get(`http://localhost:3000/api/locations/cities?countryId=${countryId}&regionAdmin1Code=${admin1Code}&q=${query}`);
        setCitySuggestions(response.data);
        setShowCitySuggestions(true); // Показываем список предложений
    } catch (error) {
        console.error('Ошибка при получении городов:', error);
        setCitySuggestions([]);
    }
}, []);

    // Debounced fetch functions
    const debouncedFetchCountry = useCallback(debounce(fetchSuggestionsCountry, 300), [fetchSuggestionsCountry]);
    const debouncedFetchRegion = useCallback(debounce(fetchSuggestionsRegion, 300), [fetchSuggestionsRegion]);
    const debouncedFetchCity = useCallback(debounce(fetchSuggestionsCity, 300), [fetchSuggestionsCity]);

     // Handlers for input changes
    const handleCountryChange = (e) => {
        const value = e.target.value;
        setSearchTermCountry(value);
        debouncedFetchCountry(value);  
        
        // Если страна удалена (пустое значение), сбрасываем регион и город
        if (!value) {
            setSelectedCountry(null);
            setSelectedRegion(null); // Сбрасываем регион
            setSelectedCity(null); // Сбрасываем город
            setSearchTermRegion(''); // Очищаем поле региона
            setSearchTermCity(''); // Очищаем поле города
        }
    };

    const handleRegionChange = (e) => {
        const value = e.target.value;
        setSearchTermRegion(value);
        if (selectedCountry) {
            debouncedFetchRegion(selectedCountry.id, value);
        }

        // Если регион удален (пустое значение), сбрасываем город
        if (!value) {
            setSelectedRegion(null);
            setSelectedCity(null); // Сбрасываем город
            setSearchTermCity(''); // Очищаем поле города
        }
    };

    const handleCityChange = (e) => {
        const value = e.target.value;
        setSearchTermCity(value);
        if (selectedCountry && selectedRegion) {
            debouncedFetchCity(selectedCountry.id, selectedRegion.id, value);
        }
    };

const handleSelectCountry = (country) => {
        setSelectedCountry(country);
        setSearchTermCountry(country.name_ru || country.name_en); // Устанавливаем выбранную страну
        setShowCountrySuggestions(false); // Скрываем список предложений
        setRegionSuggestions([]); // Очищаем предложения регионов
        setCitySuggestions([]); // Очищаем предложения городов
        setSelectedRegion(null); // Сбрасываем выбранный регион
        setSelectedCity(null); // Сбрасываем выбранный город
        setSearchTermRegion(''); // Очищаем поле региона
        setSearchTermCity(''); // Очищаем поле города
    };

    const handleSelectRegion = (region) => {
        setSelectedRegion(region);
        setSearchTermRegion(region.name_ru || region.name_en); // Устанавливаем выбранный регион
        setShowRegionSuggestions(false); // Скрываем список предложений
        setCitySuggestions([]); // Очищаем предложения городов
        setSelectedCity(null); // Сбрасываем выбранный город
        setSearchTermCity(''); // Очищаем поле города
    };

    const handleSelectCity = (city) => {
        setSelectedCity(city);
        setSearchTermCity(city.name_ru || city.name_en); // Устанавливаем выбранный город
        setShowCitySuggestions(false); // Скрываем список предложений
    };

    // Save updated location
    const handleSaveLocation = async () => {
    if (selectedCountry && selectedRegion && selectedCity) {
      
        try {
            const response = await axios.patch(`http://localhost:3000/api/users/${user.id}/location`, {
                country_id: selectedCountry.id,
                region_id: selectedRegion.id,
                city_id: selectedCity.id,
            });
            console.log('Ответ от сервера:', response.data);
            alert('Данные успешно сохранены!');
            setIsEditing(false)
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            alert('Не удалось сохранить данные.');
        }
    } else {
        alert('Пожалуйста, выберите страну, регион и город из выпадающего списка.');
    }
};

    return (
        <div>
         <div className="location-edit-component">
            {isEditing ? (
                <form onSubmit={handleSaveLocation}>
                <h5>Редактировать локацию</h5>
                <div>
                    <label htmlFor="country">Страна:</label>
                    <input
                        type="text"
                        id="country"
                        value={searchTermCountry}
                        onChange={handleCountryChange}
                        placeholder="Введите страну"
                        autoComplete="off"
                    />
                    {showCountrySuggestions && (
                        <ul>
                            {countrySuggestions.map((country) => (
                                <li key={country.id} onClick={() => handleSelectCountry(country)}>
                                    {country.name_ru || country.name_en}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Аналогично для региона и города */}
                <div>
                    <label htmlFor="region">Регион:</label>
                    <input
                        type="text"
                        id="region"
                        value={searchTermRegion}
                        onChange={handleRegionChange}
                        placeholder="Введите регион"
                        disabled={!selectedCountry}
                        autoComplete="off"
                    />
                    {showRegionSuggestions && (
                        <ul>
                            {regionSuggestions.map((region) => (
                                <li key={region.id} onClick={() => handleSelectRegion(region)}>
                                    {region.name_ru || region.name_en}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <label htmlFor="city">Город:</label>
                    <input
                        type="text"
                        id="city"
                        value={searchTermCity}
                        onChange={handleCityChange}
                        placeholder="Введите город"
                        disabled={!selectedRegion}
                        autoComplete="off"
                    />
                    {showCitySuggestions
&& (
                        <ul>
                            {citySuggestions.map((city) => (
                                <li key={city.id} onClick={() => handleSelectCity(city)}>
                                    {city.name_ru || city.name_en}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="submit">Сохранить</button>
            </form>
            ) : (
                <div className="user-profile-block">
                    <div>Локация: {initialData.city.name_ru}, {initialData.region.name_ru}, {initialData.country.name_ru}</div>
                    <button className="custom-button">
                        <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" onClick={() => setIsEditing(true)} />
                    </button>
                </div>
           )}
        </div>
        </div>
    );
};

export default MyLocation;
