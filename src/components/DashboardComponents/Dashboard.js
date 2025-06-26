import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserProfile from './UserProfile'; // Убедитесь, что этот компонент существует
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
            try {
                if (user && user.id) { // Проверка на наличие user и его id
                    const response = await axios.get(`http://localhost:3000/api/users/${user.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}` // Если требуется токен для авторизации
                        }
                    });
                    setUserData(response.data); // Получаем данные из response.data
                } else {
                    throw new Error('Пользователь не найден');
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user, token]); // Добавьте user и token в зависимости

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Личный кабинет</h1>
            {userData && (
                <>
                    <UserProfile userData={userData} />
                    <UserSettings userData={userData} setUserData={setUserData} />
                    <UserOrders userId={userData.id} />
                    <UserNotifications userId={userData.id} />
                </>
            )}
        </div>
    );
};

export default Dashboard;
