// src/components/UserList.js
import React from 'react';
import UserCard from './UserCard'; // Будет создан далее
{/*
import './UserList.css'; // Для стилей этого компонента
*/}
const UserList = ({ users, loading, pagination, onPageChange }) => {
  const { totalUsers, totalPages, currentPage } = pagination;

  if (loading) {
    return <p>Загрузка пользователей...</p>;
  }

  if (!users || users.length === 0) {
    return <p>Пользователи не найдены.</p>;
  }

  return (
    <div className="user-list-container">
      <div className="user-list">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Предыдущая
          </button>
          <span>
            Страница {currentPage} из {totalPages} (Всего пользователей: {totalUsers})
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Следующая
          </button>
        </div>
      )}

      {/* Простая стилизация для UserList */}
      <style jsx>{`
        .user-list-container {
          margin-top: 20px;
        }
        .user-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px 0;
        }
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 15px;
        }
        .pagination-controls button {
          padding: 8px 15px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .pagination-controls button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UserList;
