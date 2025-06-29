import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

function ChildComponent({ child, index, handleChildChange, removeChild, genders, educationForms }) {

    return (
        <div key={index} className="d-flex align-items-center mb-2 child-row">
            <select
                className="form-select form-select-sm me-2"
                value={child.gender?.id || ''} // Используем безопасное обращение
                onChange={(e) => handleChildChange(index, 'gender', { id: e.target.value })}
            >
                <option value="">Пол</option>
                {genders.map(gender => (
                    <option key={gender.id} value={gender.id}>{gender.gender}</option>
                ))}
            </select>
            <input
                type="date"
                className="form-control form-select-sm me-2"
                value={child.birth_date ? child.birth_date.split('T')[0] : ''} // Форматирование даты
                onChange={(e) => handleChildChange(index, 'birth_date', e.target.value)}
            />
            <select
                className="form-select form-select-sm me-2"
                value={child.education_form?.id || ''}
                onChange={(e) => handleChildChange(index, 'education_form', { id: e.target.value })}
            >
                <option value="">Форма обучения</option>
                {educationForms.map(form => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                ))}
            </select>
            <button type="button" onClick={() => removeChild(index)} className="btn btn-sm">
                <FontAwesomeIcon icon={faTrashCan} />
            </button>
        </div>
    );
}

export default ChildComponent;
