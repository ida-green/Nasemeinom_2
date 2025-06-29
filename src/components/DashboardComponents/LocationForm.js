import React, { useState, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';

const LocationForm = ({ onFilterChange }) => {
    const [searchTermCountry, setSearchTermCountry] = useState('');
    const [searchTermRegion, setSearchTermRegion] = useState('');
    const [searchTermCity, setSearchTermCity] = useState('');
    
    const [countrySuggestions, setCountrySuggestions] = useState([]);
    const [regionSuggestions, setRegionSuggestions] = useState([]);
    const [citySuggestions, setCitySuggestions] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    const fetchSuggestionsCountry = useCallback(async (query) => {
        if (query.length < 2) return;
        try {
            const response = await axios.get(`http://localhost:3000/api/locations/countries?q=${query}`);
            setCountrySuggestions(response.data);
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
        } catch (error) {
            console.error('Ошибка при получении городов:', error);
            setCitySuggestions([]);
        }
    }, []);

    const debouncedFetchCountry = useCallback(debounce(fetchSuggestionsCountry, 300), [fetchSuggestionsCountry]);
    const debouncedFetchRegion = useCallback(debounce(fetchSuggestionsRegion, 300), [fetchSuggestionsRegion]);
    const debouncedFetchCity = useCallback(debounce(fetchSuggestionsCity, 300), [fetchSuggestionsCity]);

    const handleCountryChange = (e) => {
        const value = e.target.value;
        setSearchTermCountry(value);
        debouncedFetchCountry(value);
    };

    const handleRegionChange = (e) => {
        const value = e.target.value;
        setSearchTermRegion(value);
        if (selectedCountry) {
            debouncedFetchRegion(selectedCountry.id, value);
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
        setSearchTermCountry(`${country.name_ru} ${country.name_en}`);
        setCountrySuggestions([]);
        onFilterChange({ country_id: country.id });
    };

    const handleSelectRegion = (region) => {
        setSelectedRegion(region);
        setSearchTermRegion(`${region.name_ru} ${region.name_en}`);
        setRegionSuggestions([]);
        onFilterChange({ admin1_code: region.id });
    };

    const handleSelectCity = (city) => {
        setSelectedCity(city);
        setSearchTermCity(city.name_ru || city.name_en);
        setCitySuggestions([]);
        onFilterChange({ city_id: city.id });
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
        onFilterChange({ country_id: null, admin1_code: null, city_id: null });
    };

    return (
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
                {countrySuggestions.length > 0 && (
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
                />
                {regionSuggestions.length > 0 && (
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
                />
                {citySuggestions.length > 0 && (
                    <ul className="list-group">
                        {citySuggestions.map((city) => (
                            <li key={city.id} className="list-group-item" onClick={() => handleSelectCity(city)}>
                                {city.name_ru || city.name_en}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button className="btn btn-secondary" onClick={handleClearFilters}>Очистить фильтры</button>
        </div>
    );
};

export default LocationForm;
