import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

function ChildComponent({ child, index, handleChildChange, removeChild, genders, educationForms }) {
    const handleDateChange = (event) => {
        handleChildChange(index, 'birth_date', event.target.value);
    };

    const handleGenderChange = (event) => {
        handleChildChange(index, 'gender', event.target.value);
    };

    const handleEducationFormChange = (event) => {
        handleChildChange(index, 'education_form', {id: event.target.value}); // Обратите внимание на это изменение
    };

    return (
        <div key={index} className="d-flex align-items-center mb-2 child-row">
            <select
                className="form-select form-select-sm me-2"
                value={child.gender || ''}
                onChange={handleGenderChange}
            >
                <option value="">Пол</option>
                {genders.map(gender => (
                    <option key={gender.id} value={gender.id}>{gender.gender}</option>
                ))}
            </select>
            <input
                type="date"
                className="form-control form-select-sm me-2"
                value={child.birth_date || ''}
                onChange={handleDateChange}
            />
            <select
                className="form-select form-select-sm me-2"
                value={child.education_form?.id || ''}
                onChange={handleEducationFormChange}
            >
                <option value="">Форма обучения</option>
                {educationForms.map(form => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                ))}
            </select>
            <button type="button" onClick={() => removeChild(index)} className="btn btn-danger btn-sm">
                <FontAwesomeIcon icon={faTrashCan} />
            </button>
        </div>
    );
}

export default ChildComponent;
