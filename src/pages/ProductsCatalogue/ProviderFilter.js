import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ProviderFilter = ({ providers, onProviderChange }) => {
    const [isOpen, setIsOpen] = useState(false); // Состояние для контроля видимости списка

    const toggleList = () => {
      setIsOpen(!isOpen); // Переключаем состояние
  };

    // Сортируем массив providers по алфавиту
    const sortedProviders = [...providers].sort((a, b) => {
        // Проверяем наличие свойства title
        if (!a.title || !b.title) {
            console.warn("One of the providers is missing the 'title' property:", a, b);
            return 0; // Или любое другое значение для обработки
        }
        return a.title.localeCompare(b.title);
    });
  
    return (
      <div>
        <div className="d-flex align-items-center mb-3 mt-3">
                <div className="filter-title me-2">ОРГАНИЗАТОР</div>
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
          {sortedProviders.map((provider) => (
            <div className="form-check" key={provider.id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`flexCheck${provider.id}`} // Используем id для уникальности
                onChange={() => onProviderChange(provider.id)}
              />
              <label className="form-check-label" htmlFor={`flexCheck${provider.id}`}>
                {provider.title} {/* Отображаем title */}
              </label>
            </div>
          ))}
        </div>
        )}
      </div>
    );
};

ProviderFilter.propTypes = {
    providers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            contactPersonName: PropTypes.string,
            contactPersonSurname: PropTypes.string,
            email: PropTypes.string,
            phone: PropTypes.string,
            logo: PropTypes.string,
            license: PropTypes.string,
            description: PropTypes.string,
            createdAt: PropTypes.string,
            updatedAt: PropTypes.string,
        })
    ).isRequired,
};
  
export default ProviderFilter;
