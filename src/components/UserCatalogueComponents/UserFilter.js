import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';

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

  const fetchSuggestionsCountry = useCallback(async (query, setSuggestions) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/locations/countries?q=${query}`);
      setSuggestions(response.data);
      console.log('Предложения по странам', response.data)
    } catch (error) {
      console.error('Ошибка при получении стран:', error);
      setSuggestions([]);
    }
  }, []);

  const fetchSuggestionsRegion = useCallback(async (countryId, query, setSuggestions) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/locations/regions?countryId=${countryId}&&q=${query}`);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Ошибка при получении регионов:', error);
      setSuggestions([]);
    }
  }, []);

   const fetchSuggestionsCity = useCallback(async (regionId, query, setSuggestions) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/locations/cities?regionId=${regionId}&&q=${query}`);
      setSuggestions(response.data);
    } catch (error) {
      console.error('Ошибка при получении городов:', error);
      setSuggestions([]);
    }
  }, []);
  
  const debouncedFetchSuggestionsCountry = useCallback(debounce(fetchSuggestionsCountry, 300), [fetchSuggestionsCountry]);
  const debouncedFetchSuggestionsRegion = useCallback(debounce(fetchSuggestionsRegion, 300), [fetchSuggestionsRegion]);
  const debouncedFetchSuggestionsCity = useCallback(debounce(fetchSuggestionsCity, 300), [fetchSuggestionsCity]);

   useEffect(() => {
    if (searchTermCountry.length >= 2) {
      debouncedFetchSuggestionsCountry(searchTermCountry, setCountrySuggestions);
    } else {
      setCountrySuggestions([]);
    }
  }, [searchTermCountry, debouncedFetchSuggestionsCountry]); 

  useEffect(() => {
    if (searchTermRegion.length >= 2 && selectedCountry) {
      debouncedFetchSuggestionsRegion(selectedCountry.id, searchTermRegion, setRegionSuggestions);
    } else {
      setRegionSuggestions([]);
    }
  }, [searchTermRegion, selectedCountry, debouncedFetchSuggestionsRegion]);

  useEffect(() => {
    if (searchTermCity.length >= 2 && selectedRegion) {
      debouncedFetchSuggestionsCity(selectedRegion.id, searchTermCity, setCitySuggestions);
    } else {
      setCitySuggestions([]);
    }
  }, [searchTermCity, selectedRegion, debouncedFetchSuggestionsCity]);

   const handleFilterChange = () => {
    onFilterChange({ 
        country_id: selectedCountry ? selectedCountry.id : null, 
        admin1_code: selectedRegion ? selectedRegion.admin1_code : null, // Изменено
        city_id: selectedCity ? selectedCity.id : null 
    });
};


  return (
    <div>
      {/* Фильтр стран */}
      <input
        type="text"
        value={searchTermCountry}
        onChange={(e) => setSearchTermCountry(e.target.value)}
        placeholder="Выберите страну"
      />
      <ul>
        {countrySuggestions.map((country) => (
          <li key={country.id} onClick={() => setSelectedCountry(country)}>
            {country.name_ru}
          </li>
        ))}
      </ul>

      {/* Фильтр регионов (аналогично) */}
      <input
        type="text"
        value={searchTermRegion}
        onChange={(e) => setSearchTermRegion(e.target.value)}
        placeholder="Выберите регион"
        disabled={!selectedCountry}
        // Отключен, если страна не выбрана
      />
       <ul>
        {regionSuggestions.map((region) => (
          <li key={region.id} onClick={() => setSelectedRegion(region)}>
            {region.name_ru}
          </li>
        ))}
      </ul>

      {/* Фильтр городов (аналогично) */}
      <input
        type="text"
        value={searchTermCity}
        onChange={(e) => setSearchTermCity(e.target.value)}
        placeholder="Выберите город"
        disabled={!selectedRegion} // Отключен, если регион не выбран
      />
      <ul>
        {citySuggestions.map((city) => (
          <li key={city.id} onClick={() => setSelectedCity(city)}>
            {city.name_ru}
          </li>
        ))}
      </ul>

      <button onClick={handleFilterChange}>Применить фильтры</button>
    </div>
  );
};

export default UserFilter;