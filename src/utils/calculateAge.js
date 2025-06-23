// utils/calculateAge.js

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

export default calculateAge; 
