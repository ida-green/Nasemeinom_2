import React, { useState } from 'react';

const AgeFilter = ({ ageFilters, onAgeChange }) => {
    const [isOpen, setIsOpen] = useState(false); // Состояние для контроля видимости списка

    const toggleList = () => {
      setIsOpen(!isOpen); // Переключаем состояние
  };

    return (
        <div>
          <div className="d-flex align-items-center mb-3 mt-3">
                <div className="filter-title me-2">ВОЗРАСТ</div>
                <button className="btn social-icons" onClick={toggleList}>
                    {isOpen ? (
                        <i className="fa-solid fa-minus"></i> // Иконка минус
                    ) : (
                        <i className="fa-solid fa-plus"></i> // Иконка плюс
                    )}
                </button>
            </div>
            {isOpen && ( // Если список открыт, отображаем его
          <div className="scrollable-container-small">
            {ageFilters.map((age) => (
              <div className="form-check" key={age.id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`ageCheckbox${age.id}`}
                  value={age.age_filter}
                  onChange={() => onAgeChange(age.id)}
                />
                <label className="form-check-label" htmlFor={`ageCheckbox${age.id}`}>
                  {age.age_filter}
                </label>
              </div>
            ))}
          </div>
           )}
      </div>
    );
  };
  
  export default AgeFilter;