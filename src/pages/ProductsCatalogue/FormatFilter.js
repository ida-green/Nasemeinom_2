import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FormatFilter = ({ formats, onFormatChange }) => {
    const [isOpen, setIsOpen] = useState(false); // Состояние для контроля видимости списка

    const toggleList = () => {
        setIsOpen(!isOpen); // Переключаем состояние
    };

    // Сортируем массив formats по алфавиту
    const sortedFormats = [...formats].sort((a, b) => {
        // Проверяем наличие свойства format
        if (!a.format || !b.format) {
            console.warn("One of the formats is missing the 'format' property:", a, b);
            return 0; // Или любое другое значение для обработки
        }
        return a.format.localeCompare(b.format);
    });

    return (
        <div>
            <div className="d-flex align-items-center mb-3 mt-3">
                <div className="filter-title me-2">ФОРМАТ</div>
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
                    {sortedFormats.map((format) => (
                        <div className="form-check" key={format.id}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`flexCheck${format.id}`} // Используем id для уникальности
                                onChange={() => onFormatChange(format.id)}
                            />
                            <label className="form-check-label" htmlFor={`flexCheck${format.id}`}>
                                {format.format} {/* Отображаем format */}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

FormatFilter.propTypes = {
    formats: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            format: PropTypes.string.isRequired,
            createdAt: PropTypes.string,
            updatedAt: PropTypes.string,
        })
    ).isRequired,
};

export default FormatFilter;
