import React, { useState, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

const LocationForm = ({ formData }) => {
    const [searchTermCountry, setSearchTermCountry] = useState(formData.country?.name_ru || formData.country?.name_en || '');
    const [searchTermRegion, setSearchTermRegion] = useState(formData.region?.name_ru || formData.region?.name_en || '');
    const [searchTermCity, setSearchTermCity] = useState(formData.city?.name_ru || formData.city?.name_en || '');
    const [countrySuggestions, setCountrySuggestions] = useState([]);
    const [regionSuggestions, setRegionSuggestions] = useState([]);
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(formData.country || null);
    const [selectedRegion, setSelectedRegion] = useState(formData.region || null);
    const [selectedCity, setSelectedCity] = useState(formData.city || null);

    // Флаги для управления видимостью списков
    const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
    const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

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

    const fetchSuggestionsCity = useCallback(async (countryId, regionId, query) => {
        if (query.length < 2) return;
        try {
            const response = await axios.get(`http://localhost:3000/api/locations/cities?countryId=${countryId}&regionId=${regionId}&q=${query}`);
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
        try {
            await axios.post(`http://localhost:3000/api/users/${formData.id}/location`, {
                country: selectedCountry,
                region: selectedRegion,
                city: selectedCity,
            });
            alert('Данные успешно сохранены!');
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            alert('Не удалось сохранить данные.');
        }
    };

    const handleClearFilters = () => {
        setSearchTermCountry('');
        setSearchTermRegion('');
        setSearchTermCity('');
        setCountrySuggestions([]);
        setRegionSuggestions([]);
        setCitySuggestions([]);
        setSelectedCountry(null);
        setSelectedRegion(null);
        setSelectedCity(null);
    };

    return (
        <div className="row">
        <form>
            <div className="row">
                <div className="col-12 col-md-4 mb-3">
                    <label htmlFor="country" className="form-label">Страна</label>
                    <input
                        type="text"
                        className="form-control"
                        id="country"
                        placeholder="страна"
                        value={searchTermCountry}
                        onChange={handleCountryChange}
                    />
                    {showCountrySuggestions && countrySuggestions.length > 0 && (
                        <ul className="list-group">
                            {countrySuggestions.map((country) => (
                                <li key={country.id} className="list-group-item" onClick={() => handleSelectCountry(country)}>
                                    {country.name_ru} ({country.name_en})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="col-12 col-md-4 mb-3">
                    <label htmlFor="region" className="form-label">Регион</label>
                    <input
                        type="text"
                        className="form-control"
                        id="region"
                        placeholder="регион"
                        value={searchTermRegion}
                        onChange={handleRegionChange}
                        disabled={!selectedCountry} // Делаем поле неактивным, если страна не выбрана
                    />
                    {showRegionSuggestions && regionSuggestions.length > 0 && (
                        <ul className="list-group">
                            {regionSuggestions.map((region) => (
                                <li key={region.id} className="list-group-item" onClick={() => handleSelectRegion(region)}>
                                    {region.name_ru} ({region.name_en})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="col-12 col-md-4 mb-3">
                    <label htmlFor="city" className="form-label">Город</label>
                    <input
                        type="text"
                        className="form-control"
                        id="city"
                        placeholder="город"
                        value={searchTermCity}
                        onChange={handleCityChange}
                        disabled={!selectedRegion} // Делаем поле неактивным, если регион не выбран
                    />
                    {showCitySuggestions && citySuggestions.length > 0 && (
                        <ul className="list-group">
                            {citySuggestions.map((city) => (
                                <li key={city.id} className="list-group-item" onClick={() => handleSelectCity(city)}>
                                    {city.name_ru || city.name_en}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <button 
                type="submit" 
                className="btn button-btn button-btn-primary btn-sm mb-3"
                onClick={(e) => {
                    e.preventDefault();
                    handleSaveLocation();
                }}
            >Сохранить изменения</button>
        </form>    
        </div>
    );
};

export default LocationForm;
