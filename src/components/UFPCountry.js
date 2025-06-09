import React, { useState, useEffect } from 'react';

const UFPCountry = ({ user, locations }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (locations && user) {
      const country = locations.find(loc => loc.name === user.countryName);
      if (country) {
        setSelectedCountry(country);
        const region = country.Regions?.find(reg => reg.name === user.regionName);
        if (region) {
          setSelectedRegion(region);
          const city = region.Cities?.find(c => c.name === user.cityName);
          if (city) {
            setSelectedCity(city);
          }
        }
      }
    }
  }, [user, locations]);

  const handleCountryChange = (event) => {
    const country = locations.find(loc => loc.name === event.target.value);
    setSelectedCountry(country);
    setSelectedRegion(null);
    setSelectedCity(null);
  };

  const handleRegionChange = (event) => {
    const region = selectedCountry?.Regions?.find(reg => reg.name === event.target.value);
    setSelectedRegion(region);
    setSelectedCity(null);
  };

  const handleCityChange = (event) => {
    const city = selectedRegion?.Cities?.find(c => c.name === event.target.value);
    setSelectedCity(city);
  };

  return (
    <div className="col-md-12">
      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="country" className="form-label">Страна</label>
          <select 
            id="country" 
            name="country" 
            className="form-select"
            aria-label="Country"
            required
            value={selectedCountry?.name || ''} 
            onChange={handleCountryChange}
          >
            <option value="">Выберите страну</option>
            {locations && locations.map(location => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="region" className="form-label">Регион</label>
          {selectedCountry && (
            <select
              id="region" 
              name="region"
              className="form-select" 
              aria-label="Region"
              required
              disabled={!selectedCountry}
              value={selectedRegion?.name || ''} 
              onChange={handleRegionChange}
            >
            <option value="">Выберите регион</option>
            {selectedCountry.Regions?.map(region => (
              <option key={region.id} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="col-md-4">
        <label htmlFor="city" className="form-label">Город</label>
        {selectedRegion && (
          <select
            id="city" 
            name="city"
            className="form-select" 
            aria-label="City"
            required
            disabled={!selectedRegion}
            value={selectedCity?.name || ''} 
            onChange={handleCityChange}
          >
            <option value="">Выберите город</option>
            {selectedRegion.Cities?.map(city => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  </div>
);
};

export default UFPCountry;