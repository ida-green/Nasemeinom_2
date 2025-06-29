import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChildComponent from './ChildComponent';

const UserSettings = ({ userData, setUserData, educationForms, genders }) => {
    const [formData, setFormData] = useState({
        ...userData, // Копируем существующие данные пользователя
        children: [...userData.children] // Копируем массив детей
    });
    const [error, setError] = useState('');

    const isChildDataFilled = (child) => child.gender && child.birth_date && child.education_form?.id;
    
    useEffect(() => {
        // Инициализируем formData при первом рендере (заполняем данные об имеющихся детях)
        setFormData({ ...userData, children: [...userData.children] });
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(''); // Очищаем сообщение об ошибке после каждого изменения
    };

    // Редактируем данные о детях
    const handleChildChange = (index, fieldName, value) => {
        const updatedChildren = [...formData.children];
        updatedChildren[index] = { ...updatedChildren[index], [fieldName]: value };
        setFormData({ ...formData, children: updatedChildren });
        setError(''); // Очищаем сообщение об ошибке
    };

    const addChild = () => {
        const lastChild = formData.children.length > 0 ? formData.children[formData.children.length - 1] : null;
        if (lastChild && !isChildDataFilled(lastChild)) {
            setError('Необходимо заполнить данные о текущем ребенке!');
            return;
        }
        setFormData({ ...formData, children: [...formData.children, { birth_date: null, gender: null, education_form: { id: null } }] });
        setError('');
    };

    const removeChild = (index) => {
        const updatedChildren = [...formData.children].filter((_, i) => i !== index);
        setFormData({ ...formData, children: updatedChildren });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/update/${userData.id}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setUserData(response.data);
            setError('');
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
            setError('Ошибка при сохранении данных!');
        }
    };

    const renderChildren = () => (
        formData.children.map((child, index) => (
            <div key={index} className="mb-2">
                <ChildComponent
                    child={child}
                    index={index}
                    handleChildChange={handleChildChange}
                    removeChild={removeChild}
                    genders={genders}
                    educationForms={educationForms}
                />
            </div>
        ))
    );



    return (
        <div className="user-settings">
            <h2>Настройки</h2>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="name" className="form-label">Имя</label>
                        <input type="text" className="form-control" id="name" placeholder="имя" value={formData.name} onChange={handleChange} />
                    </div>

                    <div
                    className="col-12 col-md-4 mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="password" className="form-label">Пароль</label>
                        <input type="password" className="form-control" id="password" placeholder="пароль" value={formData.password} onChange={handleChange} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="telegramUsername" className="form-label">Имя в Телеграм</label>
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="basic-addon1">@</span>
                            <input type="text" className="form-control" placeholder="username" aria-label="Username" aria-describedby="basic-addon1" value={formData.telegramUsername} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="col-12 col-md-4 mb-3">
                        <label htmlFor="phone" className="form-label">Телефон</label>
                        <input type="tel" className="form-control" id="phone" placeholder="+79117654321" value={formData.phone} onChange={handleChange} />
                    </div>
                </div>

            <div className="row">
            <div className="col-12 col-md-4 mb-3">
            <label for="country" className="form-label">Страна</label>
            <input type="text" className="form-control" id="country" placeholder="страна" value={formData.country.name_ru} onChange={handleChange} />
            </div>
           
            <div className="col-12 col-md-4 mb-3">
            <label for="region" className="form-label">Регион</label>
            <input type="text" className="form-control" id="region" placeholder="регион" value={formData.region.name_ru} onChange={handleChange}/>
            </div>

            <div className="col-12 col-md-4 mb-3">
            <label for="city" className="form-label">Город</label>
            <input type="text" className="form-control" id="city" placeholder="город" value={formData.city.name_ru} onChange={handleChange}/>
            </div>
            </div>
            
            <div className="mb-3">
            <label for="description" className="form-label">О себе:</label>
            <textarea className="form-control" id="description" rows="3" placeholder="чем вы занимаетесь" value={formData.description} onChange={handleChange} ></textarea>
            </div>

             {renderChildren()}
                <button type="button" onClick={addChild}>Добавить ребенка</button>
              
                {error && <div className="alert alert-danger">{error}</div>}


            <div className="mb-3">
            <label for="family description" className="form-label">О семье:</label>
            <textarea className="form-control" id="family description" rows="3" placeholder="расскажите немного о вашем семейном образовании и какой у вас запрос" value={formData.familyDescription} onChange={handleChange} ></textarea>
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
