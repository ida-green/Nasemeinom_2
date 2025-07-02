import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChildComponent from './ChildComponent';
import LocationForm from './LocationForm';

const UserSettings = ({ user, userData, setUserData, educationForms, genders }) => {
    const [formData, setFormData] = useState(userData);
    
    
    return (
        <div className="user-settings">
            <h2>Настройки</h2>
            <form>
                <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="name" className="form-label">Имя</label>
                        <input type="text" className="form-control" id="name" placeholder="имя" value={formData.name} />
                    </div>

                    <div
                    className="col-12 col-md-4 mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="email" placeholder="name@example.com" value={formData.email} />
                    </div>

                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="password" className="form-label">Пароль</label>
                        <input type="password" className="form-control" id="password" placeholder="пароль" value={formData.password}  />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="telegramUsername" className="form-label">Имя в Телеграм</label>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">@</span>
                            <input type="text" className="form-control" placeholder="username" aria-label="Username" aria-describedby="basic-addon1" value={formData.telegramUsername}  />
                        </div>
                    </div>

                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="phone" className="form-label">Телефон</label>
                        <input type="tel" className="form-control" id="phone" placeholder="+79117654321" value={formData.phone} />
                    </div>
                </div>

            <LocationForm user={user} userData={userData} />
            <ChildComponent 
                user={user} 
                userData={userData}
                educationForms = {educationForms} 
                genders = {genders} />
                
            
            <div className="mb-3">
            <label for="description" className="form-label">О себе:</label>
            <textarea className="form-control" id="description" rows="3" placeholder="чем вы занимаетесь" value={formData.description}  ></textarea>
            </div>

            

            <div className="mb-3">
            <label for="family description" className="form-label">О семье:</label>
            <textarea className="form-control" id="family description" rows="3" placeholder="расскажите немного о вашем семейном образовании и какой у вас запрос" value={formData.familyDescription} ></textarea>
            </div>

            <div className="col-12 col-md-6 mb-3">
            <label for="family description" className="form-label">Фото пользователя:</label>
             <div className="input-group">
            <input type="file" class="form-control" id="userImage" />
            <label class="input-group-text" for="userImage">Загрузить</label>
            </div>
            </div>
            
            <div className="col-12 col-md-6 mb-3">
            <label for="family description" className="form-label">Фото семьи:</label>
            <div className="input-group">
            <input type="file" class="form-control" id="familyImage" />
            <label class="input-group-text" for="familyImage">Загрузить</label>
            </div>
            </div>
             
                <button 
                type="submit" className="btn button-btn button-btn-primary btn-sm mt-3 mb-3"
                >Сохранить изменения</button>
            </form>
        </div>
    );
};

export default UserSettings;
