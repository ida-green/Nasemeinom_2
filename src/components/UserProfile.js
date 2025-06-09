import React, { useState } from 'react';
import axios from 'axios';

const UserProfile = ({ user, updateUser }) => {
    const [editedUser, setEditedUser] = useState({}); // Инициализация пустым объектом
    const [isEditing, setIsEditing] = useState(false);
    const token = localStorage.getItem('jwtToken');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('http://localhost:3000/user/me', editedUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Данные пользователя успешно обновлены:', response.data);
            updateUser(response.data);
            setEditedUser(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error.response ? error.response.data : error.message);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedUser({...user}); // Копируем данные пользователя в editedUser при нажатии "Редактировать"
    };

    return (
        
        <li className="list-group-item">
            <p>
                <a data-bs-toggle="collapse" href="#user-profile" aria-expanded="false" aria-controls="user-profile">
                    Мой профиль
                </a>
            </p>
            <div className="collapse" id="user-profile">
                <div className="card card-body">
                    <div className="row">
                        <div className="col-md-2">
                            <img src={user.userImageUrl} alt="изображение" className="user-profile-photo" />
                        </div>
                        <div className="col-md-10 mt-3">
                            {isEditing ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="user-profile-update">
                                    <div class="mb-2">
                                    <label for="user-profile-name" class="form-label">Имя</label>
                                    <input 
                                        type="text"
                                        name="name"
                                        class="form-control"
                                        id="user-profile-name"
                                        placeholder="имя"
                                        value={editedUser.name}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div class="mb-2">
                                    <label for="user-profile-surname" class="form-label">Фамилия</label>
                                    <input 
                                        type="text"
                                        name="surname"
                                        class="form-control"
                                        id="user-profile-surname"
                                        placeholder="фамилия"
                                        value={editedUser.surname}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div class="mb-2">
                                    <label for="user-profile-surname" class="form-label">Логин</label>
                                    <input 
                                        type="text"
                                        name="login"
                                        class="form-control"
                                        id="user-profile-login"
                                        placeholder="логин"
                                        value={editedUser.login}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div class="mb-2">
                                    <label for="user-profile-email" class="form-label">Email</label>
                                    <input 
                                        type="email"
                                        name="email"
                                        class="form-control"
                                        id="user-profile-email"
                                        placeholder="email"
                                        value={editedUser.email}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div class="mb-2">
                                    <label for="user-profile-telephone" class="form-label">Телефон</label>
                                    <input 
                                        type="telephone"
                                        name="telephone"
                                        class="form-control"
                                        id="user-profile-telephone"
                                        placeholder="телефон"
                                        value={editedUser.phone}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <div class="mb-2">
                                    <label for="user-profile-password" class="form-label">Пароль</label>
                                    <input 
                                        type="text"
                                        name="password"
                                        class="form-control"
                                        id="user-profile-password"
                                        placeholder="********"
                                        value={editedUser.password}
                                        onChange={handleChange}
                                    />
                                    </div>
                                    <button className="btn btn-outline-secondary mt-2 me-3" type="submit">Сохранить</button>
                                    <button 
                                        className="btn btn-outline-secondary mt-2" 
                                        type="button" 
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Отмена
                                    </button>
                                </div>    
                                </form>
                            ) : (
                                <div>
                                    <p>{user.name} {user.surname}</p>
                                    <p>Email: {user.email}</p>
                                    <p>Тел.: {user.phone}</p>
                                    <button 
                                        className="btn btn-outline-secondary mt-2" 
                                        onClick={handleEditClick}>
                                        Редактировать
                                    </button>
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

export default UserProfile;