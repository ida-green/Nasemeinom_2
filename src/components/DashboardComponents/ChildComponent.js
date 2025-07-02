import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import useAuth from '../../hooks/useAuth'; 

function ChildComponent({ userData, genders, educationForms }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        ...userData,
        children: [...userData.children]
    });
    const [error, setError] = useState('');
    const componentRef = useRef(null);

    useEffect(() => {
        // Инициализируем formData при первом рендере
        setFormData({ ...userData, children: [...userData.children] });
    }, [userData]);

    const isChildDataFilled = (child) => child.gender && child.birth_date && child.education_form?.id;

    const handleChildChange = (index, fieldName, value) => {
        const updatedChildren = [...formData.children];
        updatedChildren[index] = { ...updatedChildren[index], [fieldName]: value };
        setFormData({ ...formData, children: updatedChildren });
        setError(''); // Очищаем сообщение об ошибке
    };

    const addChild = () => {
        const lastChild = formData.children.length > 0 ? formData.children[formData.children.length - 1] : null;
        if (lastChild && !isChildDataFilled(lastChild)) {
            setError('Необходимо заполнить данные о текущем ребенке');
            return;
        }
        setFormData({ ...formData, children: [...formData.children, { birth_date: null, gender: null, education_form: { id: null } }] });
        setError('');
    };

    const removeChild = async (index) => {
    try {
        // Отправляем запрос на сервер для удаления ребенка
        await axios.delete(`http://localhost:3000/api/users/${user.id}/children/${formData.children[index].id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Если удаление прошло успешно, обновляем состояние
        const updatedChildren = formData.children.filter((_, i) => i !== index); // Фильтруем удаленного ребенка
        setFormData({ ...formData, children: updatedChildren });
        setError('');
    } catch (error) {
        console.error('Ошибка при удалении ребенка:', error);
        setError('Ошибка при удалении ребенка!');
    }
};

// Функция для фильтрации детей при отображении
const visibleChildren = formData.children.filter(child => !child.deleted);
    

    console.log('children: formData.children в ChildComponemt:', formData.children)
    
    const handleSubmitChildren = async (e) => {
    e.preventDefault();
    console.log('Дети, которых отправляем в patch:', formData.children)  
    try {
        // Предполагается, что formData содержит массив детей
        await axios.patch(`http://localhost:3000/api/users/${user.id}/children`, { children: formData.children }, {
            
            headers: {
                'Content-Type': 'application/json',
            },
        });
        setError('');
        // Дополнительно можно обработать успешное обновление, например, показать уведомление
    } catch (error) {
        console.error('Ошибка при обновлении данных о детях:', error);
        setError('Ошибка при сохранении данных о детях!');
    }
};

    const handleClickOutside = (event) => {
        if (componentRef.current && !componentRef.current.contains(event.target)) {
            setError(''); // Сбрасываем ошибку
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="mb-3" ref={componentRef}>
            <label htmlFor="description" className="form-label">Дети</label>
            {visibleChildren.map((child, index) => (
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
                    <button type="button" onClick={() => removeChild(index)} className="btn p-0">
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                </div>
            ))}
            {error && <div className="text-danger">{error}</div>}
            <button type="button" onClick={addChild}>Добавить ребенка</button>
            <button type="submit" onClick={handleSubmitChildren}>Сохранить</button>
        </div>
    );
}

export default ChildComponent;

