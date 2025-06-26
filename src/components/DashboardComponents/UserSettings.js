import React, { useState } from 'react';

const UserSettings = ({ userData, setUserData }) => {
    const [formData, setFormData] = useState({ ...userData });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Отправка обновленных данных на сервер
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });
        const updatedUserData = await response.json();
        setUserData(updatedUserData);
    };

    return (
        <div className="user-settings">
            <h2>Настройки</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Имя:
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </label>
                {/* Добавьте другие поля по мере необходимости */}
                <button type="submit">Сохранить изменения</button>
            </form>
        </div>
    );
};

export default UserSettings;
