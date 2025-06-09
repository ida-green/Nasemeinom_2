import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AspectFilter = ({ aspects, onAspectChange }) => {
  const [isOpen, setIsOpen] = useState(false); // Состояние для контроля видимости списка

  const toggleList = () => {
    setIsOpen(!isOpen); // Переключаем состояние
  };

  // Фильтруем и сортируем только валидные элементы
  const sortedAspects = aspects
    .filter(aspect => aspect && aspect.aspect) // Фильтруем только валидные элементы
    .sort((a, b) => {
      if (!a.aspect || !b.aspect) {
        console.warn("One of the aspects is missing the 'aspect' property:", a, b);
        return 0; // Или любое другое значение для обработки
      }
      return a.aspect.localeCompare(b.aspect);
    });

  return (
    <div>
      <div className="d-flex align-items-center mb-3 mt-3">
        <div className="filter-title me-2">АСПЕКТЫ</div>
        <button className="btn social-icons" onClick={toggleList}>
          {isOpen ? (
            <i className="fa-solid fa-minus"></i> // Иконка минус
          ) : (
            <i className="fa-solid fa-plus"></i> // Иконка плюс
          )}
        </button>
      </div>
      {isOpen && ( // Если список открыт, отображаем его      
        <div className="scrollable-container-big">
          {sortedAspects.map((aspect) => (
            <div className="form-check" key={aspect.id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`flexCheck${aspect.id}`}
                onChange={() => onAspectChange(aspect.id)}
              />
              <label className="form-check-label" htmlFor={`flexCheck${aspect.id}`}>
                {aspect.aspect}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

AspectFilter.propTypes = {
  aspects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      aspect: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  ).isRequired,
};

export default AspectFilter;
