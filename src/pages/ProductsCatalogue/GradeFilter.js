import React, { useState } from 'react';

const GradeFilter = ({ gradeFilters, onGradeChange }) => {
    const [isOpen, setIsOpen] = useState(false); // Состояние для контроля видимости списка

    const toggleList = () => {
      setIsOpen(!isOpen); // Переключаем состояние
  };

    return (
        <div>
        <div className="d-flex align-items-center mb-3 mt-3">
                <div className="filter-title me-2">КЛАСС</div>
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
          {gradeFilters.map((grade) => (
            <div className="form-check" key={grade.id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`ageCheckbox${grade.id}`}
                value={grade.grade_filter}
                onChange={() => onGradeChange(grade.id)}
              />
              <label className="form-check-label" htmlFor={`ageCheckbox${grade.id}`}>
                {grade.grade_filter}
              </label>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  };
  
  export default GradeFilter;