import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AuthorFilter = ({ authors, onAuthorChange }) => {
   const [isOpen, setIsOpen] = useState(false); // Состояние для контроля видимости списка

   const toggleList = () => {
    setIsOpen(!isOpen); // Переключаем состояние
};

  // Сортируем массив authors по алфавиту (по имени и фамилии)
  const sortedAuthors = [...authors].sort((a, b) => {
    const fullNameA = `${a.name} ${a.surname}`;
    const fullNameB = `${b.name} ${b.surname}`;
    return fullNameA.localeCompare(fullNameB);
  });

  return (
    <div>
      <div className="d-flex align-items-center mb-2 mt-3">
                <div className="filter-title me-3">АВТОР</div>
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
        {sortedAuthors.map((author) => (
          <div className="form-check" key={author.id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`flexCheckAuthor${author.id}`}
              onChange={() => onAuthorChange(author.id)}
            />
            <label className="form-check-label" htmlFor={`flexCheckAuthor${author.id}`}>
              {`${author.surname} ${author.name}`}
            </label>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

AuthorFilter.propTypes = {
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      surname: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  ).isRequired,
};

export default AuthorFilter;
