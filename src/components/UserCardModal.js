// UserProfileModal.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserCardModal.css';
import Modal from 'react-modal';
import { getInitials } from '../utils'
import calculateAge from '../utils/calculateAge';
import { DEFAULT_AVATAR_URL } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram as telegramIcon } from '@fortawesome/free-brands-svg-icons';

const UserCardModal = ({ isOpen, onRequestClose, userId }) => {
    const [user, setUser] = useState(null); // Состояние для хранения пользователя
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние для ошибок

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return; // Если нет userId, ничего не делаем

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:3000/api/users/${userId}`); 
                setUser(response.data);
            } catch (err) {
                setError('Ошибка при загрузке пользователя');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId, isOpen]); // Запускаем эффект при изменении userId или isOpen

    if (loading) return <div>Загрузка...</div>; // Показываем индикатор загрузки
    if (error) return <div>{error}</div>; // Показываем ошибку, если она есть
    if (!user) return null; // Если пользователя нет, ничего не отображаем

    const hasDescription = user.description && user.description.trim() !== '';
    const hasChildren = user.children && user.children.length > 0;
    const hasFamilyImage = user.familyImageUrl;
    const hasFamilyDescription = user.familyDescription && user.familyDescription.trim() !== '';
    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} ariaHideApp={false} >
            <div className="user-card"> {/* Главный контейнер карточки */}
                <div className="user-main-info">
                    <div className="user-card-header-inner">
                        {user.userImageUrl ? (
                            <img
                                src={user.userImageUrl}
                                alt={`${user.name}'s avatar`}
                                className="user-card-avatar"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_AVATAR_URL;
                                }}
                            />
                        ) : (
                            <div className="user-card-avatar user-card-avatar-placeholder">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <div className="user-info">
                            <h2 className="user-name">{user.name}</h2>
                            {user.country && user.country.name_ru && (
              <p className="user-card-location">
                {(() => {
                  // Инициализируем переменные для отображаемых частей
                  let cityDisplayName = user.city?.name_ru;
                  let regionDisplayName = user.region?.name_ru;
                  let countryDisplayName = user.country.name_ru;

                  // Проверяем условие: если город и регион существуют И их названия совпадают
                  if (cityDisplayName && regionDisplayName && cityDisplayName === regionDisplayName) {
                    regionDisplayName = null; // Устанавливаем регион в null, чтобы он был отфильтрован
                  }

                  // Собираем части адреса в желаемом порядке
                  // Сначала город, потом регион (который может быть null), потом страна
                  const locationParts = [
                    cityDisplayName,
                    regionDisplayName,
                    countryDisplayName
                  ].filter(Boolean); // Отфильтровываем все falsy значения (null, undefined, пустые строки)

                  // Объединяем оставшиеся части запятыми
                  return locationParts.join(', ');
                })()}
              </p>
            )}
                        </div>
                    </div>
                    {hasDescription && (
                        <div className="user-description">
                            <div><strong>О себе:</strong></div>
                            <p>{user.description}</p>
                        </div>
                    )}
                    {hasChildren && (
                        <div className="user-children-section">
                            <div><strong>Дети:</strong></div>
                            <ul>
                                {user.children.map((child) => {
                                    let educationFormDisplay = '';
                                    if (child.education_form && child.education_form.title) {
                                        if (child.education_form.title === "дошкольник/ца") {
                                            educationFormDisplay = child.gender?.gender === "мальчик" ? "дошкольник" : "дошкольница";
                                        } else if (child.education_form.title === "окончил(а) школу") {
                                            educationFormDisplay = child.gender?.gender === "мальчик" ? "окончил школу" : "окончила школу";
                                        } else {
                                            educationFormDisplay = child.education_form.title;
                                        }
                                    }
                                    const childInfoParts = [];
                                    if (child.gender && child.gender.gender) {
                                        childInfoParts.push(child.gender.gender);
                                    }
                                    childInfoParts.push(calculateAge(child.birth_date));
                                    if (educationFormDisplay) {
                                        childInfoParts.push(educationFormDisplay);
                                    }
                                    return (
                                        <li key={child.id}>
                                            {childInfoParts.join(', ')}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
                {hasFamilyImage && (
                    <div className="user-family-image-section">
                        <img src={user.familyImageUrl} alt="Семейное фото" />
                    </div>
                )}
                {hasFamilyDescription && (
                    <div className="user-family-section">
                        <div><strong>О семье:</strong></div>
                        <p>{user.familyDescription}</p>
                    </div>
                )}
                
                {/* Блок с иконкой Telegram */}
                  {user.telegramUsername && (
                    <div className="telegram-section">
                        <a 
                          href={`https://t.me/${user.telegramUsername.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="telegram-icon"
                        >
                          <FontAwesomeIcon icon={telegramIcon} size="2x" />

                        </a>
                    </div>
                  )}

            {/* Кнопка "Закрыть" */}
             <button 
                onClick={onRequestClose} 
                className="custom-button"
                aria-label="Закрыть модальное окно"
            >
                Закрыть
            </button>

            </div>
        </Modal>
    );
};

export default UserCardModal;
