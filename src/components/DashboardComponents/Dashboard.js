import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';
import UserOrders from './UserOrders';
import UserNotifications from './UserNotifications';
import useAuth from '../../hooks/useAuth'; 


const Dashboard = () => {
    const { user, token } = useAuth();
    const [userData, setUserData] = useState(null);
    const [educationForms, setEducationForms] = useState([]);
    const [genders, setGenders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    // Загрузка данных пользователя из API
    const fetchUserData = async () => {
        try {
            if (user && user.id) {
                const response = await axios.get(`http://localhost:3000/api/users/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserData(response.data);
            } else {
                throw new Error('Пользователь не найден');
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRefData = async () => { //Функция для получения справочников
        try {
            const educationResponse = await axios.get('http://localhost:3000/api/educationForms/');
            setEducationForms(educationResponse.data);

            const genderResponse = await axios.get('http://localhost:3000/api/educationForms/genders'); // Исправлено: /api/genders
            setGenders(genderResponse.data);
        } catch (error) {
            console.error('Ошибка при загрузке справочников:', error);
        }
    };

    fetchUserData();
    fetchRefData(); // Вызываем функцию отдельно
}, [user, token]);

    if (loading) {
        return <div>Loading...</div>;
    }

     if (!educationForms || !genders) {
        return <div>Загрузка данных...</div>;
    }
    
    return (
        <div className="container">
        <div className="col-12">
            <div className="container mt-3">
                    <nav aria-label="breadcrumb">
                      <ol class="breadcrumb">
                        <li class="breadcrumb-item"><Link aria-current="page" to="/">Главная</Link></li>
                        <li class="breadcrumb-item active" aria-current="page">Личный кабинет</li>
                      </ol>
                    </nav>
                              
                  <div className="col-12">
                    <h1 className="section-title h3"><span>Личный кабинет</span></h1>
                  </div>
        <div className="dashboard">
            {userData && (
                <>
                    <UserProfile 
                    user={user} 
                    userData={userData} 
                    educationForms = {educationForms} 
                    genders = {genders}/>

                   
                    <UserNotifications userId={userData.id} />
                </>
            )}
        </div>
        </div>    
        </div>
        </div>
    );
};

export default Dashboard;
