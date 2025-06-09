// Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile.js';
import UserFamilyProfile from '../components/UserFamilyProfile.js';
import UserPosts from '../components/UserPosts.js';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [children, setChildren] = useState([]);
    const [locations, setLocations] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                setError('Необходимо войти в систему');
                setLoading(false);
                return;
            }
            setError(null); // Сбрасываем ошибку
            try {
                const response = await axios.get('http://localhost:3000/user/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                setError(error.response ? error.response.data.message : 'Произошла ошибка при загрузке данных');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [refresh]);

    useEffect(() => {
        const fetchLocations = async () => {
            setError(null); // Сбрасываем ошибку
            try {
                const locationsResponse = await axios.get('http://localhost:3000/api/locations');
                setLocations(locationsResponse.data);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке данных');
            }
        };

        fetchLocations();
    }, []);

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        setRefresh(refresh + 1);
    };

    const getCountryNameById = (id) => {
        const country = locations.find(c => c.id === id);
        return country ? country.name : '';
    };
    const getRegionNameById = (countryId, regionId) => {
        const country = locations.find(c => c.id === countryId);
        const region = country?.Regions.find(r => r.id === regionId);
        return region ? region.name : '';
    };

    const getCityNameById = (countryId, regionId, cityId) => {
        const country = locations.find(c => c.id === countryId);
        const region = country?.Regions.find(r => r.id === regionId);
        const city = region?.Cities.find(c => c.id === cityId);
        return city ? city.name : '';
    };

    const userWithLocationNames = user ? {
        ...user,
        countryName: getCountryNameById(user.country),
        regionName: getRegionNameById(user.country, user.region),
        cityName: getCityNameById(user.country, user.region, user.city),
    } : null;
    console.log(userWithLocationNames)
    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>Ошибка: данные пользователя не загружены.</div>;

    // Возврат основного контента
console.log(userWithLocationNames)
    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="breadcrumbs">
                            <ul>
                                <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                                <li><span>Личный кабинет</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="container-fluid">
                <ul className="col-12 list-group">
                <UserProfile user={userWithLocationNames} updateUser={updateUser} />
                <UserFamilyProfile user={userWithLocationNames} locations={locations} />
                <UserPosts user={userWithLocationNames} />
                    {/* ... остальные элементы списка ... */}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
