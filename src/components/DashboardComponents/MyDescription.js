import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';

const MyDescription = ({ user, userData }) => {
    const [description, setDescription] = useState(userData.description || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleSaveDescription = async (event) => {
        event.preventDefault(); // Предотвращаем отправку формы

        try {
            const response = await axios.patch(`http://localhost:3000/api/users/${user.id}/description`, {
                description,
            });
            console.log('Ответ от сервера при редактировании описания:', response.data);
            alert('Описание успешно сохранено!');
            setIsEditing(false); // Закрываем редактирование только при успешном сохранении
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            alert('Не удалось сохранить описание.');
        }
    };

    return (
        <div>
            <div className="user-profile-block">
                <div>
                    <strong>О себе:</strong> {description || 'Описание отсутствует.'}
                </div>
                <button className="btn custom-button" onClick={() => setIsEditing(true)}>
                    <FontAwesomeIcon icon={faPenToSquare} className="fa-lg" />
                </button>
            </div>

            {isEditing && (
                <form onSubmit={handleSaveDescription}>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label"><h5>Редактировать "О себе":</h5></label>
                        <textarea
                            className="form-control"
                            id="description"
                            rows="3"
                            placeholder="чем вы занимаетесь"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)} // Обновляем состояние при изменении текста
                        />
                    </div>
                    <button type="submit" className="btn button-btn button-btn-primary btn-sm mb-3">Сохранить</button>
                     <button type="button" className="btn button-btn button-btn-outline-primary btn-sm mb-3" onClick={() => setIsEditing(false)}>Закрыть</button>
                </form>
            )}
        </div>
    );
};

export default MyDescription;
