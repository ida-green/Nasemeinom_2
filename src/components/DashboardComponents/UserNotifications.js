import React, { useEffect, useState } from 'react';

const UserNotifications = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const response = await fetch(`/api/notifications?userId=${userId}`);
            const data = await response.json();
            setNotifications(data);
        };
        fetchNotifications();
    }, [userId]);

    return (
        <div className="user-notifications">
            <h2>Уведомления</h2>
            {notifications.length === 0 ? (
                <p>Нет уведомлений.</p>
            ) : (
                <ul>
                    {notifications.map(notification => (
                        <li key={notification.id}>{notification.message}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserNotifications;
