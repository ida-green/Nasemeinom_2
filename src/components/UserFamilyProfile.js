import React, { useState, useEffect } from 'react';
import axios from 'axios';

import UFPCountry from './UFPCountry.js';
import UFPChildren from './UFPChildren.js';
import UFPDescription from './UFPDescription.js';
import UFPFamilyDescription from './UFPFamilyDescription.js';
import UFPFamilyImage from './UFPFamilyImage.js';
import FamilyCard from './FamilyCard.js';

const UserFamilyProfile = ({ user, locations, updateUser }) => {
    const [editedUser, setEditedUser] = useState({});
    const [educationForms, setEducationForms] = useState([]);
    const [children, setChildren] = useState(user.children || [{ name: '', gender_id: '', birthDate: '', educationForm: '' }]);
    const [isEditing, setIsEditing] = useState(false);
    const [familyCardOnOff, setFamilyCardOnOff] = useState(user.familyCardOnOff);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        if (user.children) {
            // Инициализация состояния детей с преобразованием gender_id и education_form_id в названия
            setChildren(user.children.map(child => ({
                name: child.name || '',
                gender_id: child.gender_id || '',
                birthDate: child.birth_date || '',
                educationForm: child.education_form_id || ''
            })));
        }
    }, [user]);
    useEffect(() => {
        const fetchEducationForms = async () => {
            setError(null);
            try {
                const educationFormsResponse = await axios.get('http://localhost:3000/api/educationForms');
                setEducationForms(educationFormsResponse.data);
                console.log(educationFormsResponse.data);
            } catch (err) {
                console.error('Ошибка при загрузке форм образования:', err);
                setError('Ошибка при загрузке форм образования');
            }
        };

        fetchEducationForms();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSubmit = () => {
        setIsEditing(true);
    };

    const handleOnOff = async (isVisible) => {
        // Обновляем локальное состояние
        setFamilyCardOnOff(isVisible);

        // Отправляем данные на сервер
        try {
            const response = await axios.put('http://localhost:3000/api/user/update', {
                familyCardOnOff: isVisible,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            // Обновляем состояние пользователя, если нужно
            updateUser(response.data);
        } catch (error) {
            console.error('Ошибка при обновлении видимости карточки:', error);
            // Можно добавить обработку ошибки, например, показать уведомление пользователю
        }
    };

    
    return (
        <li className="list-group-item">
                <p>
                    <a data-bs-toggle="collapse" href="#family-profile" aria-expanded="false" aria-controls="family-profile">
                        Моя семья
                    </a>
                </p>
            
            <div className="collapse" id="family-profile">
                <div className="card card-body">
                        <div className="col-md-12 mt-3">
                            {isEditing ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="user-profile-update">
                                        <UFPCountry user={user} locations={locations} 
                                        editedUser={editedUser} />
                                        <UFPDescription user={user} updateUser={updateUser} editedUser={editedUser} />
                                        <UFPChildren user={user} editedUser={editedUser} />
                                        <UFPFamilyDescription user={user} editedUser={editedUser} />
                                        <UFPFamilyImage user={user} editedUser={editedUser} />
                                    </div>
                                    <button 
                                        className="btn btn-outline-secondary mt-2" 
                                        onClick={handleSubmit}>
                                        Сохранить
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    <div className="row">
                                        <div className="col-12 col-md-4">
                                        <FamilyCard 
                                        key={user.id} 
                                        family={user}
                                        children={children}
                                        countryName={(user.countryName)}
                                        regionName={(user.regionName)}
                                        cityName={(user.cityName)}
                                    />
                                        </div>
                                        <div className="col-12 col-md-8">
                                            <div className="mb-3">Заполните и включите карточку, если вы хотите познакомиться с другими семьями на СО в вашем городе - общаться, дружить, создать локальное сообщество. Карточка вашей семьи отображается в разделе "Семьи". Карточка не должна содержать коммерческую информацию. 
                                            </div>
                                            <button 
                                                className="btn btn-outline-secondary mt-2 mb-3" 
                                                onClick={handleEditClick}>
                                                Редактировать карточку
                                            </button>
                                            <div>Видимость карточки</div>
                                            <div className="col-12 col-md-4 form-check mt-2">
                                            <input 
                                                className="form-check-input" 
                                                type="radio" 
                                                name="flexRadioDefault" 
                                                id="family-card-visible" 
                                                checked={familyCardOnOff} 
                                                onChange={() => handleOnOff(true)} 
                                            />
                                            <label className="form-check-label" htmlFor="family-card-visible">
                                                вкл.
                                            </label>
                                        </div>
                                        <div className="col-12 col-md-4 form-check">
                                            <input 
                                                className="form-check-input"
                                                type="radio"
                                                name="flexRadioDefault"
                                                id="family-card-invisible"
                                                checked={!familyCardOnOff} 
                                                onChange={() => handleOnOff(false)} 
                                            />
                                            <label className="form-check-label" htmlFor="family-card-invisible">
                                                выкл.
                                            </label>
                                        </div>        
                                            
                                        </div>   
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
        </li>
    );
};

export default UserFamilyProfile;
