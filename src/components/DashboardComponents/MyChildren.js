import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import useAuth from '../../hooks/useAuth'; 

function ChildComponent({ userData, genders, educationForms }) {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        ...userData,
        children: [...userData.children]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [notificationDelete, setNotificationDelete] = useState('');
    const componentRef = useRef(null);

    useEffect(() => {
        // Инициализируем formData при первом рендере
        setFormData({ ...userData, children: [...userData.children] });
    }, [userData]);

    const isChildDataFilled = (child) => child.gender && child.birth_date && child.education_form?.id;

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleChildChange = (index, fieldName, value) => {
        const updatedChildren = [...formData.children];
        updatedChildren[index] = { ...updatedChildren[index], [fieldName]: value };
        setFormData({ ...formData, children: updatedChildren });
        setError(''); // Очищаем сообщение об ошибке
    };

    // Добавляем пусту строку для внесения данных о новом ребенке
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
        // Получаем информацию о ребенке, которого хотим удалить
        const childToRemove = formData.children[index];

        if (childToRemove.id) {
            // Если у ребенка есть id, отправляем запрос на сервер для удаления
            await axios.delete(`http://localhost:3000/api/users/${user.id}/children/${childToRemove.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Обновляем локальное состояние, удаляя ребенка
        setFormData(prevState => ({
            ...prevState,
            children: prevState.children.filter((_, i) => i !== index)
        }));
        
        
    } catch (error) {
        console.error('Ошибка при удалении ребенка:', error);
        setError('Ошибка при удалении ребенка!');
    }
};

// Функция для фильтрации детей при отображении
const visibleChildren = formData.children.filter(child => !child.deleted);

// Обновленная функция handleSubmitChildren
const handleSubmitChildren = async (e) => {
    e.preventDefault();
    console.log('Дети, которых отправляем в patch:', formData.children);
    try {
        // Фильтруем детей, чтобы исключить тех, кто помечен как удаленные
        const childrenToSubmit = formData.children.filter(child => !child.deleted);

        // Отправляем PATCH запрос на сервер
        const response = await axios.patch(`http://localhost:3000/api/users/${user.id}/children`, 
            { children: childrenToSubmit }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Получаем обновленные данные о детях из ответа сервера
        const updatedChildren = response.data.updatedChildren;

        // Обновляем состояние пользователя с новыми данными о детях
        setUser(prevUser => ({
            ...prevUser,
            children: updatedChildren // Заменяем массив детей на обновленный
        }));

        setIsEditing(false); // Закрываем режим редактирования

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
        <div className="user-profile-block">
            

        {isEditing ? (        
        <div className="mb-3" ref={componentRef}>
            <label htmlFor="description" className="form-label">Редактировать информацию о детях</label>
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
            <div><button 
                type="button" 
                className="btn custom-button mb-3"
                onClick={addChild}>Добавить ребенка</button>
            </div>    
            <div>
            <button 
                type="submit" 
                className="btn button-btn button-btn-primary btn-sm mb-3" 
                onClick={handleSubmitChildren}>Сохранить</button>
            {/*    
            {notification && <div className="notification">{notification}</div>}
            */}
            <button 
                type="button" 
                className="btn button-btn button-btn-outline-primary btn-sm mb-3" 
                onClick={() => setIsEditing(false)}>Закрыть</button>
            </div>    
            
        </div>
         ) : (
            <div>
            <div>Дети:</div>
            <ul>
                {userData.children.map((child, index) => (
                    <li key={index} className="child-item">
                        <div className="child-data">
                            {child.gender ? <span>{child.gender.gender}</span> : null}
                            {child.birth_date && (
                                <span>
                                    {new Date(child.birth_date).toLocaleDateString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                    })}
                                </span>
                            )}
                            {child.education_form ? <span>{child.education_form.title}</span> : null}
                        </div>
                    </li>
                ))}
            </ul>
            <button className="custom-button" onClick={handleEditClick}>
                <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
            </button>
            </div>
         )}
         </div>
    )}

export default ChildComponent;
