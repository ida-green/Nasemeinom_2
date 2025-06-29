import React from 'react';

const UserProfile = ({ userData }) => {
    return (
        <div className="user-profile">
            <p>{userData.name}</p>
            {/* Добавьте другие поля по мере необходимости */}
        </div>
    );
};

export default UserProfile;
