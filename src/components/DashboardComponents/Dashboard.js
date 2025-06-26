import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';
import UserOrders from './UserOrders';
import UserNotifications from './UserNotifications';
import useAuth from '../../hooks/useAuth'; 

const Dashboard = () => {
    const { user, token } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Загрузка данных пользователя из API
        const fetchUserData = async () => {
            const response = await axios.get(`http://localhost:3000/api/users/${user.id}`);
            const data = await response.json();
            setUserData(data);
            setLoading(false);
        };
        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Личный кабинет</h1>
            <UserProfile userData={userData} />
            <UserSettings userData={userData} setUserData={setUserData} />
            <UserOrders userId={userData.id} />
            <UserNotifications userId={userData.id} />
        </div>
    );
};

export default Dashboard;
