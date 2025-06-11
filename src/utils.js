// Генерация Id гостевого пользователя 
export const generateGuestId = () => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guestId', guestId);
    }
    return guestId;
  };
  
  // Получение Id гостевого пользователя из localstorage
  export const getGuestIdFromLocalStorage = () => {
    try {
      const guestId = localStorage.getItem('guestId');
      return guestId;
    } catch (error) {
      console.error("Error getting guestId from localStorage:", error);
      return null;
    }
  };

  // Сохранение Id гостевого пользователя в localstorage
export const setGuestIdToLocalStorage = (guestId) => {
  try {
    localStorage.setItem('guestId', guestId);
  } catch (error) {
    console.error("Error setting guestId to localStorage:", error);
  }
};

// Функция для получения инициалов
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean); // Разделяем по пробелу и убираем пустые части
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0][0].toUpperCase(); // Если только одно слово (например, "Иван")
  }
  // Берем первую букву первого слова и первую букву последнего слова
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Если DEFAULT_AVATAR_URL - это тоже константа, которая часто используется,
// вы могли бы экспортировать ее из того же helpers.js и импортировать здесь.
export const DEFAULT_AVATAR_URL = '/images/default-avatar.png';

// Вы можете добавить сюда и другие вспомогательные функции, например, calculateAge, если они у вас там
// export const calculateAge = (birthDate) => { /* ... */ };