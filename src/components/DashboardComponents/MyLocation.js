import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import useAuth from '../../hooks/useAuth'; 

const MyLocation = ({ userData }) => {
const { user, setUser } = useAuth();
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

    const fetchSuggestionsCity = useCallback(async (countryId, admin1Сode, query) => {
    if (query.length < 2) return;
    try {
        const response = await axios.get(`http://localhost:3000/api/locations/cities?countryId=${countryId}&regionAdmin1Code=${admin1Сode}&q=${query}`);
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
        setRegionSuggestions([]); // Очищаем предложения регионов
        setCitySuggestions([]); // Очищаем предложения городов
        setShowCountrySuggestions(false); // Скрываем список предложений для стран
    } else {
        setShowCountrySuggestions(true); // Показываем список предложений для стран
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
        setCitySuggestions([]); // Очищаем предложения городов
        setShowRegionSuggestions(false); // Скрываем список предложений для регионов
    } else {
        setShowRegionSuggestions(true); // Показываем список предложений для регионов
    }
};

const handleCityChange = (e) => {
    const value = e.target.value;
    setSearchTermCity(value);

    if (selectedCountry && selectedRegion) {
        // Используем admin1_code вместо region.id
        debouncedFetchCity(selectedCountry.id, selectedRegion.admin1_code, value);
    }

    // Если город удален (пустое значение), сбрасываем выбранный город
    if (!value) {
        setSelectedCity(null);
        setCitySuggestions([]); // Очищаем предложения городов
        setShowCitySuggestions(false); // Скрываем список предложений для городов
    } else {
        setShowCitySuggestions(true); // Показываем список предложений для городов
    }
};

const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setSearchTermCountry(`${country.name_ru}` || `${country.name_en}`); // Устанавливаем выбранную страну
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
    setSearchTermRegion(`${region.name_ru}` || `${region.name_en}`); // Устанавливаем выбранный регион
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
    const handleSaveLocation = async (event) => {
        event.preventDefault(); // Предотвращаем отправку формы
    if (selectedCountry && selectedRegion && selectedCity) {
        try {
            const response = await axios.patch(`http://localhost:3000/api/users/${user.id}/location`, {
                country_id: selectedCountry.id,
                region_id: selectedRegion.id,
                city_id: selectedCity.id,
            });
            console.log('Ответ от сервера при редактировании локации в профиле:', response.data);
            alert('Данные успешно сохранены!');

            // Обновляем состояния с новыми значениями в инпутах
                setSearchTermCountry(selectedCountry.name_ru || selectedCountry.name_en);
                setSearchTermRegion(selectedRegion.name_ru || selectedRegion.name_en);
                setSearchTermCity(selectedCity.name_ru || selectedCity.name_en);

                // Обновляем initialData для отображения в профиле
                setInitialData({
                    ...initialData,
                    country: selectedCountry,
                    region: selectedRegion,
                    city: selectedCity,
                });


            setIsEditing(false); // Закрываем редактирование только при успешном сохранении
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            alert('Не удалось сохранить данные.');
        }
    } else {
        alert('Пожалуйста, выберите страну, регион и город из выпадающего списка.');
    }
};

 const handleClose = () => {
        // Сброс значений инпутов к данным из базы
        setSearchTermCountry(initialData.country.name_ru || '');
        setSearchTermRegion(initialData.region.name_ru || '');
        setSearchTermCity(initialData.city.name_ru || '');
        setShowCountrySuggestions(false);
        setShowRegionSuggestions(false); // Скрываем список предложений
        setCitySuggestions([]); // Очищаем предложения городов
        setIsEditing(false);
    };

    return (
        <div>

        <div className="user-profile-block">
            <div>
                Локация: {initialData.city.name_ru}
                {initialData.region.name_ru !== initialData.city.name_ru && `, ${initialData.region.name_ru}`}
                , {initialData.country.name_ru}
            </div>
            <button className="btn custom-button" onClick={() => setIsEditing(true)}>
                <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
            </button>
        </div>

        {isEditing && (
            <form onSubmit={handleSaveLocation}>
    <h5>Редактировать локацию</h5>
    <div className="input-container row">
        <div className="col-md-4 mb-3 position-relative">
            <label htmlFor="country" className="form-label">Страна:</label>
            <input
                type="text"
                id="country"
                className="form-control"
                value={searchTermCountry}
                onChange={handleCountryChange}
                placeholder="Введите страну"
                autoComplete="off"
            />
            {showCountrySuggestions && (
                <ul className="list-group suggestions-list position-absolute">
                    {countrySuggestions.map((country) => (
                        <li 
                            key={country.id} 
                            className="list-group-item list-group-item-action" 
                            onClick={() => handleSelectCountry(country)}
                        >
                            {country.name_ru || country.name_en}
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <div className="col-md-4 mb-3 position-relative">
            <label htmlFor="region" className="form-label">Регион:</label>
            <input
                type="text"
                id="region"
                className="form-control"
                value={searchTermRegion}
                onChange={handleRegionChange}
                placeholder="Введите регион"
                disabled={!selectedCountry}
                autoComplete="off"
            />
            {showRegionSuggestions && (
                <ul className="list-group suggestions-list position-absolute">
                    {regionSuggestions.map((region) => (
                        <li 
                            key={region.id} 
                            className="list-group-item list-group-item-action" 
                            onClick={() => handleSelectRegion(region)}
                        >
                            {region.name_ru || region.name_en}
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <div className="col-md-4 mb-3 position-relative">
            <label htmlFor="city" className="form-label">Город:</label>
            <input
                type="text"
                id="city"
                className="form-control"
                value={searchTermCity}
                onChange={handleCityChange}
                placeholder="Введите город"
                disabled={!selectedRegion}
                autoComplete="off"
            />
            {showCitySuggestions && (
                <ul className="list-group suggestions-list position-absolute">
                    {citySuggestions.map((city) => (
                        <li 
                            key={city.id} 
                            className="list-group-item list-group-item-action" 
                            onClick={() => handleSelectCity(city)}
                        >
                            {city.name_ru || city.name_en}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
    <button type="submit" className="btn button-btn button-btn-primary btn-sm mb-3">Сохранить</button>
    <button type="button" className="btn button-btn button-btn-outline-primary btn-sm mb-3" onClick={() => handleClose()}>Закрыть</button>
            </form>
            )}
        </div>
    )
};

export default MyLocation;
