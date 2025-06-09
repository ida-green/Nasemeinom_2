// src/components/UserCard.js

// src/components/UserCatalogueComponents/UserCard.js
import React from 'react';
import '../../styles/UserCard.css';

// ВСЕ ИМПОРТЫ ДОЛЖНЫ БЫТЬ ВЫШЕ ЭТОЙ СТРОКИ
// ИМПОРТЫ date-fns:
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';
import { ru } from 'date-fns/locale'; // Для русского языка

/**
 * Возвращает правильную форму слова для русского языка в зависимости от числа.
 * @param {number} number Число.
 * @param {string[]} forms Массив из трех форм слова: [для 1, для 2-4, для 5+].
 * @returns {string} Правильная форма слова.
 */
const getRussianPluralForm = (number, forms) => {
  // Проверяем на отрицательные числа (для общности, хотя возраст не будет отриц.)
  const n = Math.abs(number);
  const lastTwoDigits = n % 100;
  const lastDigit = n % 10;

  // Если число заканчивается на 11-14, используем третью форму ("лет")
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return forms[2];
  }
  // Если число заканчивается на 1, используем первую форму ("год")
  if (lastDigit === 1) {
    return forms[0];
  }
  // Если число заканчивается на 2, 3 или 4, используем вторую форму ("года")
  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1];
  }
  // Во всех остальных случаях (0, 5-9), используем третью форму ("лет")
  return forms[2];
};

// Вспомогательная функция для вычисления возраста
const calculateAge = (birthDateString) => {
  if (!birthDateString) return 'Не указан';
  try {
    const birthDate = parseISO(birthDateString); // Преобразуем строку в объект Date
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Обработка случаев, когда возраст отрицательный или равен нулю
    if (age < 0) {
      return 'Дата в будущем';
    }
    if (age === 0) {
      return 'Менее года'; // Можно также вернуть "0 лет", если нужно
    }

    // Используем вспомогательную функцию для получения правильной формы
    const yearsSuffix = getRussianPluralForm(age, ['год', 'года', 'лет']);

    return `${age} ${yearsSuffix}`;
  } catch (e) {
    console.error("Ошибка при вычислении возраста:", e);
    return 'Некорректная дата';
  }
};



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
    <div className="user-card"> {/* Главный контейнер карточки */}
        
     {/* блок: Фото семьи */}
      {hasFamilyImage && (
        <div className="user-family-image-section">
          <img src={user.familyImageUrl} />
        </div>
      )}

      {/* блок: Аватар, имя, город, регион, страна, описание пользователя "О себе" */}
      <div className="user-main-info">
        <div className="user-card-header-inner">
          <img src={user.userImageUrl} alt={`${user.name}'s avatar`} className="user-avatar" />
          <div className="user-info">
            <h2 className="user-name">{user.name}</h2>
            {user.country && user.country.name_ru && (
              <p className="user-location">
                {[user.city?.name_ru, user.region?.name_ru, user.country.name_ru]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        {hasDescription && (
          <div className="user-description">
            <p>{user.description}</p>
          </div>
        )}

        {/* блок: Дети */}
      {hasChildren && (
        <div className="user-children">
          <h5><strong>Дети:</strong></h5>
          <ul>
            {user.children.map((child) => (
              <li key={child.id}>{child.gender && child.gender.gender && ` ${child.gender.gender}`}, {calculateAge(child.birth_date)}{child.education_form && child.education_form.title && `, ${child.education_form.title}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
   
      {/* блок: Описание семьи */}
      {hasFamilyDescription && (
        <div className="user-family-section">
          <h5>О семье:</h5>
          <p>{user.familyDescription}</p>
        </div>
      )}
     
    </div>
  );
};

export default UserCard;
