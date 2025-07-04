import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';

const UserFilter = ({ onFilterChange, currentFilters }) => {
  const [searchTermCountry, setSearchTermCountry] = useState('');
    const [searchTermRegion, setSearchTermRegion] = useState('');
    const [searchTermCity, setSearchTermCity] = useState('');
    
    const [countrySuggestions, setCountrySuggestions] = useState([]);
    const [regionSuggestions, setRegionSuggestions] = useState([]);
    const [citySuggestions, setCitySuggestions] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState(currentFilters.country || null);
    const [selectedRegion, setSelectedRegion] = useState(currentFilters.region || null);
    const [selectedCity, setSelectedCity] = useState(currentFilters.city || null);
  
  const fetchSuggestionsCountry = useCallback(async (query) => {
        if (query.length < 2) return; // Не запрашиваем, если меньше 2 символов
        try {
            const response = await axios.get(`http://localhost:3000/api/locations/countries?q=${query}`);
            setCountrySuggestions(response.data);
        } catch (error) {
            console.error('Ошибка при получении стран:', error);
            setCountrySuggestions([]);
        }
    }, []);

  const fetchSuggestionsRegion = useCallback(async (countryId, query) => {
        if (query.length < 2) return; // Не запрашиваем, если меньше 2 символов
        try {
            const response = await axios.get(`http://localhost:3000/api/locations/regions?countryId=${countryId}&q=${query}`);
            setRegionSuggestions(response.data);
        } catch (error) {
            console.error('Ошибка при получении регионов:', error);
            setRegionSuggestions([]);
        }
    }, []);

    const fetchSuggestionsCity = useCallback(async (countryId, admin1Code, query) => {
        if (query.length < 2) return; // Не запрашиваем, если меньше 2 символов
        try {
            const response = await axios.get(`http://localhost:3000/api/locations/cities?countryId=${countryId}&regionAdmin1Code=${admin1Code}&q=${query}`);
            setCitySuggestions(response.data);
        } catch (error) {
            console.error('Ошибка при получении городов:', error);
            setCitySuggestions([]);
        }
    }, []);

  const debouncedFetchCountry = useCallback(debounce(fetchSuggestionsCountry, 300), [fetchSuggestionsCountry]);
  const debouncedFetchRegion = useCallback(debounce(fetchSuggestionsRegion, 300), [fetchSuggestionsRegion]);
  const debouncedFetchCity = useCallback(debounce(fetchSuggestionsCity, 300), [fetchSuggestionsCity]);
    
     // Обработчики изменения ввода
    const handleCountryChange = (e) => {
        const value = e.target.value;
        setSearchTermCountry(value);
        debouncedFetchCountry(value);
        // Сбрасываем регион и город при изменении страны
        setSelectedRegion(null);
        setSelectedCity(null);
        setSearchTermRegion('');
        setSearchTermCity('');
        setRegionSuggestions([]);
        setCitySuggestions([]);
    };


    const handleRegionChange = (e) => {
        const value = e.target.value;
        setSearchTermRegion(value);
        if (selectedCountry) {
            debouncedFetchRegion(selectedCountry.id, value);
            // Сбрасываем город при изменении региона
            setSelectedCity(null);
            setSearchTermCity('');
            setCitySuggestions([]);
        }
    };

    const handleCityChange = (e) => {
        const value = e.target.value;
        setSearchTermCity(value);
        if (selectedCountry && selectedRegion) {
            debouncedFetchCity(selectedCountry.id, selectedRegion.admin1_code, value);
        }
    };

 // Функции для выбора предложения
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setSearchTermCountry(country.name_ru ? country.name_ru : country.name_en);
    setCountrySuggestions([]);
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
   setSearchTermRegion(region.name_ru ? region.name_ru : region.name_en);
    setRegionSuggestions([]);
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setSearchTermCity(city.name_ru ? city.name_ru : city.name_en); // Устанавливаем название города в поле ввода
    setCitySuggestions([]);
  };

 // Функция для очистки фильтров
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
        onFilterChange({ country_id: null, admin1_code: null, city_id: null });
    };

// Функция для применения фильтров
const handleApplyFilters = () => {
    onFilterChange({
        country_id: selectedCountry ? selectedCountry.id : null,
        admin1_code: selectedRegion ? selectedRegion.admin1_code : null,
        city_id: selectedCity ? selectedCity.id : null,
    });
};

  return (
    <div>
           <div>
            <input 
                type="text" 
                value={searchTermCountry} 
                onChange={handleCountryChange} 
                placeholder="Введите страну" 
                className="form-control mb-2"
            />
            {countrySuggestions.length > 0 && (
                <ul className="list-group">
                    {countrySuggestions.map(suggestion => (
                        <li 
                            key={suggestion.id} 
                            onClick={() => handleSelectCountry(suggestion)}
                            className="list-group-item list-group-item-action"
                        >
                            {suggestion.name_ru || suggestion.name_en}
                        </li>
                    ))}
                </ul>
            )}

            <input 
                type="text" 
                value={searchTermRegion} 
                onChange={handleRegionChange} 
                placeholder="Введите регион" 
                disabled={!selectedCountry}
                className="form-control mb-2"
            />
            {regionSuggestions.length > 0 && (
                <ul className="list-group">
                    {regionSuggestions.map(suggestion => (
                        <li 
                            key={suggestion.id} 
                            onClick={() => handleSelectRegion(suggestion)}
                            className="list-group-item list-group-item-action"
                        >
                            {suggestion.name_ru || suggestion.name_en}
                        </li>
                    ))}
                </ul>
            )}

            <input 
                type="text" 
                value={searchTermCity} 
                onChange={handleCityChange} 
                placeholder="Введите город" 
                disabled={!selectedRegion}
                className="form-control mb-2"
            />
             {citySuggestions.length > 0 && (
                <ul className="list-group">
                    {citySuggestions.map(suggestion => (
                        <li 
                            key={suggestion.id} 
                            onClick={() => handleSelectCity(suggestion)}
                            className="list-group-item list-group-item-action"
                        >
                            {suggestion.name_ru || suggestion.name_en}
                        </li>
                    ))}
                </ul>
            )}
        </div>

            <button 
            onClick={handleApplyFilters} 
            className="btn button-btn button-btn-primary btn-sm mt-3 mb-3">Применить фильтры</button>
            <button 
            onClick={handleClearFilters} 
            className="btn button-btn button-btn-outline-primary btn-sm mt-3 mb-3">Очистить фильтры</button>
        </div>
  );
};

export default UserFilter;