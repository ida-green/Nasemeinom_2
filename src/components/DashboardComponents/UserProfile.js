import React from 'react';

const UserProfile = ({ userData }) => {
    return (
        <div className="user-profile">
            <h2>Профиль</h2>
            <p>Имя: {userData.name}</p>
            <p>Email: {userData.description}</p>
            {/* Добавьте другие поля по мере необходимости */}
        </div>
    );
};

export default UserProfile;
