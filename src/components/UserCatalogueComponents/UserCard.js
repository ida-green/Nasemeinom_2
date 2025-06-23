// src/components/UserCatalogueComponents/UserCard.js
import React from 'react';
import '../../styles/UserCard.css';
import { getInitials } from '../../utils';
import { DEFAULT_AVATAR_URL } from '../../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram as telegramIcon } from '@fortawesome/free-brands-svg-icons';
import calculateAge from '../../utils/calculateAge';

// ВСЕ ИМПОРТЫ ДОЛЖНЫ БЫТЬ ВЫШЕ ЭТОЙ СТРОКИ
// ИМПОРТЫ date-fns:
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';
import { ru } from 'date-fns/locale'; // Для русского языка

const UserCard = ({ user }) => {

  const lastOnline = user.last_online_at
    ? formatDistanceToNow(parseISO(user.last_online_at), { addSuffix: true, locale: ru })
    : 'давно';

// Проверяем, есть ли описание о себе или семье, чтобы не отображать пустые блоки
  const hasDescription = user.description && user.description.trim() !== '';
  const hasFamilyDescription = user.familyDescription && user.familyDescription.trim() !== '';
  const hasChildren = user.children && user.children.length > 0;
  const hasFamilyImage = user.familyImageUrl  

  return (
    <div className="user-card "> {/* Главный контейнер карточки */}
      {/* блок: Аватар, имя, город, регион, страна, описание пользователя "О себе" */}
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
            {getInitials(user.name)} {/* <<-- Здесь используем импортированную функцию */}
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

        {/* блок: Дети */}
     {hasChildren && (
  <div className="user-children-section">
    <div><strong>Дети:</strong></div>
    <ul>
      {user.children.map((child) => {
        // Определяем текст для формы обучения
        let educationFormDisplay = '';
        
        if (child.education_form && child.education_form.title) {
          if (child.education_form.title === "дошкольник/ца") {
            // Если форма "дошкольник/ца", проверяем пол
            if (child.gender && child.gender.gender === "мальчик") {
              educationFormDisplay = "дошкольник";
            } else if (child.gender && child.gender.gender === "девочка") {
              educationFormDisplay = "дошкольница";
            } else {
              // Если пол не указан или неопределен, но форма "дошкольник/ца"
              educationFormDisplay = "дошкольник/ца"; 
            }
          } else if (child.education_form.title === "окончил(а) школу") {
            // Логика для "окончил(а) школу"
            if (child.gender && child.gender.gender === "мальчик") {
              educationFormDisplay = "окончил школу";
            } else if (child.gender && child.gender.gender === "девочка") {
              educationFormDisplay = "окончила школу";
            } else {
              educationFormDisplay = "окончил(а) школу";
            }
          } else {
            // Если форма обучения не "дошкольник/ца" и не "окончил(а) школу", используем её как есть
            educationFormDisplay = child.education_form.title;
          }
        }

        // Собираем части строки для отображения в Li
        const childInfoParts = [];

        // Добавляем пол, если он есть
        if (child.gender && child.gender.gender) {
          childInfoParts.push(child.gender.gender);
        }

        // Добавляем возраст
        childInfoParts.push(calculateAge(child.birth_date));

        // Добавляем форму обучения, если она определена
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
      {/* блок: Фото семьи */}
      {hasFamilyImage && (
        <div className="user-family-image-section">
          <img src={user.familyImageUrl} />
        </div>
      )}   

        {/* блок: Описание семьи */}
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
</div>
    
  );
};

export default UserCard;
