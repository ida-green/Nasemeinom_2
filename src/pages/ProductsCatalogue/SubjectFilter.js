import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SubjectFilter = ({ subjects, onSubjectChange }) => {
    const [isOpen, setIsOpen] = useState(false); // Состояние для контроля видимости списка

    // Сортируем массив subjects по алфавиту
    const sortedSubjects = [...subjects].sort((a, b) => {
        return a.subject.localeCompare(b.subject);
    });

    const toggleList = () => {
        setIsOpen(!isOpen); // Переключаем состояние
    };

    return (
        <div>
            <div className="d-flex align-items-center mb-3 mt-3">
                <div className="filter-title me-2">ПРЕДМЕТЫ</div>
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
                    {sortedSubjects.map((subject) => (
                        <div className="form-check" key={subject.id}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`flexCheck${subject.id}`} // Исправлено: добавлены обратные кавычки
                                onChange={() => onSubjectChange(subject.id)}
                            />
                            <label className="form-check-label" htmlFor={`flexCheck${subject.id}`}>
                                {subject.subject}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

SubjectFilter.propTypes = {
    subjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            subject: PropTypes.string.isRequired,
            createdAt: PropTypes.string,
            updatedAt: PropTypes.string,
        })
    ).isRequired,
    onSubjectChange: PropTypes.func.isRequired, // Добавлено: проп для функции обработки изменения
};

export default SubjectFilter;
