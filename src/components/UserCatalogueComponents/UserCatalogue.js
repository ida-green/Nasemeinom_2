// src/components/UserCatalogue.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Используем axios для удобства
import UserFilter from './UserFilter'; // Будет создан далее
import UserList from './UserList'; // Будет создан далее

const UserCatalogue = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country_id: null,
    admin1_code: null, // Изменено
    city_id: null,
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
  });

  // Функция для получения пользователей с бэкенда
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Строим параметры запроса на основе текущих фильтров
    const params = new URLSearchParams();
    for (const key in filters) {
      if (filters[key] !== null && filters[key] !== '' && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/users/?${params.toString()}`);
      const { users: fetchedUsers, totalUsers: count, totalPages, currentPage } = response.data;

      setUsers(fetchedUsers);
      setPagination({
        totalUsers: count,
        totalPages: totalPages,
        currentPage: currentPage || filters.page, // Убедитесь, что текущая страница всегда актуальна
      });
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Не удалось загрузить пользователей. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  }, [filters]); 

  // Эффект, который запускается при монтировании компонента и при изменении фильтров
  useEffect(() => {
    fetchUsers();
 }, [fetchUsers, filters]); // Добавили filters в зависимости

  // Обработчик изменения фильтров из компонента UserFilter
  const handleFilterChange = (newFilterValues) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilterValues,
      page: 1, // Сброс страницы на 1 при изменении фильтров
    }));
  };

  // Обработчик изменения страницы для пагинации
  const handlePageChange = (newPage) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      page: newPage,
    }));
  };

  return (
    <div className="container">
    <div className="col-12">
    <div className="user-catalogue">
        <div className="container mt-3">
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                  <li class="breadcrumb-item"><Link aria-current="page" to="/">Главная</Link></li>
                  <li class="breadcrumb-item active" aria-current="page">Семьи</li>
                </ol>
              </nav>
                        
            <div className="col-12">
              <h1 className="section-title h3"><span>Семьи</span></h1>
            </div>
            <div className="mb-3">
            Найдите единомышленников рядом с вами, чтобы общаться, дружить, вместе учиться и поддерживать друг друга.
          </div>

      {/* Передаем функцию для обновления фильтров */}
      <UserFilter 
        onFilterChange={handleFilterChange} 
        currentFilters={filters} />

      {error && <p className="error-message">{error}</p>}

      {/* Передаем данные о пользователях и пагинации в компонент списка */}
      <UserList
        users={users}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
    </div>
    </div>
    </div>
  );
};

export default UserCatalogue;
